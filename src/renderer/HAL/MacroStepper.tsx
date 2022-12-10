/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-11
 *  @Filename: MacroStepper.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Box, Step, StepLabel, Stepper, StepperProps } from '@mui/material';
import { capitalize } from 'lodash';
import React from 'react';
import { HALContext } from '.';
import macroData from './macros.json';

export type MacroStepperProps = {
  macroName: string;
} & StepperProps;

export interface StageState {
  name: string;
  description: string;
  index: number;
  currentIndex: number;
  active: boolean;
  completed: boolean;
  disabled: boolean;
  failed: boolean;
  cancelled: boolean;
  icon?: React.ReactNode;
}

export interface IMacroData {
  [macro: string]: {
    stages: string[];
    precondition_stages?: string[];
    cleanup_stages?: string[];
    concurrent?: string[][];
    descriptions?: { [key: string]: string };
    defaults?: { [key: string]: any };
  };
}

// We use a reducer here because I cannot get the useEffect to not fall in an infinite
// loop if I use a state that's an object. There may be a cleaner way to do this.
function updateStageState(
  state: StageState[],
  newState: { macroName: string; stageStatus: string[] }
) {
  const clonedState = [...state];

  const states = newState.stageStatus.slice(1).map((x) => x.trim());

  let cancelled = false;

  const presentIndices: number[] = [];
  let currentIndex = -1;
  for (let i = 0; i < clonedState.length; i += 1) {
    let matched = false;
    for (let n = 0; n < states.length; n += 2) {
      const name: string = states[n];
      const value: string = states[n + 1];

      if (clonedState[i].name === name) {
        clonedState[i].disabled = false;
        clonedState[i].failed = false;
        clonedState[i].completed = false;
        clonedState[i].active = false;
        clonedState[i].cancelled = false;

        if (value === 'finished') {
          clonedState[i].completed = true;
        } else if (value === 'cancelled') {
          if (!cancelled) {
            clonedState[i].failed = true;
            clonedState[i].cancelled = true;
            cancelled = true;
          }
        } else if (value === 'failed') {
          clonedState[i].failed = true;
        } else if (value === 'active') {
          clonedState[i].active = true;
        }

        matched = true;
        if (!presentIndices.includes(clonedState[i].index)) currentIndex += 1;
        clonedState[i].currentIndex = currentIndex;
        presentIndices.push(clonedState[i].index);
        break;
      }
    }
    if (!matched) {
      clonedState[i].disabled = true;
    }
  }

  return clonedState;
}

export default function MacroStepper({
  macroName,
  ...props
}: MacroStepperProps) {
  const halKeywords = React.useContext(HALContext);
  const thisMacroData = (macroData as IMacroData)[macroName];

  const initialStageState: StageState[] = [];

  let n = 0;
  const allStages = [
    ...(thisMacroData.precondition_stages || []),
    ...thisMacroData.stages,
    ...(thisMacroData.cleanup_stages || []),
  ];

  allStages.forEach((stageName) => {
    let description: string;
    if (thisMacroData.descriptions && thisMacroData.descriptions[stageName]) {
      description = thisMacroData.descriptions[stageName];
    } else {
      description = capitalize(stageName);
    }

    let index = n;
    if (thisMacroData.concurrent) {
      thisMacroData.concurrent.forEach((l) => {
        if (l.includes(stageName)) {
          if (l.indexOf(stageName) > 0) {
            index -= l.indexOf(stageName);
            n -= 1;
          }
        }
      });
    }

    initialStageState.push({
      name: stageName,
      description,
      index,
      currentIndex: index,
      active: false,
      completed: false,
      disabled: false,
      failed: false,
      cancelled: false,
    });

    n += 1;
  });

  const [stageState, setStageState] = React.useReducer(
    updateStageState,
    initialStageState
  );

  const { stage_status: stageStatusKw } = halKeywords;

  // Here we just check if the keyword change has something useful and if so call the reducer.
  React.useEffect(() => {
    if (!stageStatusKw || stageStatusKw.values[0] !== macroName) return;

    setStageState({
      macroName,
      stageStatus: stageStatusKw.values,
    });
  }, [stageStatusKw, macroName]);

  return (
    <Box
      overflow='scroll'
      width='100%'
      pt={1}
      sx={{
        '::-webkit-scrollbar': {
          display: 'none',
        },
      }}
    >
      <Stepper alternativeLabel {...props}>
        {stageState.map((step) => {
          if (!step.disabled) {
            return (
              <Step
                key={step.name}
                index={step.currentIndex}
                active={step.active}
                completed={step.completed}
                sx={{ minWidth: '75px' }}
              >
                <StepLabel
                  error={step.failed}
                  sx={{ '& .MuiStepLabel-label': { mt: 0.75 } }}
                >
                  {step.description}
                </StepLabel>
              </Step>
            );
          }
          return null;
        })}
      </Stepper>
    </Box>
  );
}
