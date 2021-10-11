/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-11
 *  @Filename: macro_stepper.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import { Box, Step, StepLabel, Stepper, StepperProps } from '@mui/material';
import { capitalize } from 'lodash';
import React from 'react';
import { HALContext } from '.';
import macroData from './macros.json';

export type MacroStepperProps = StepperProps & {
  macroName: string;
};

export interface StageState {
  name: string;
  description: string;
  index: number;
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
    concurrent: string[][];
    descriptions?: { [key: string]: string };
  };
}

// We use a reducer here because I cannot get the useEffect to not fall in an infinite
// loop if I use a state that's an object. There may be a cleaner way to do this.
function updateStageState(
  state: StageState[],
  newState: { macroName: string; stages: string[]; stageStatus: string[] }
) {
  const clonedState = [...state];

  if (newState.stages[0] === newState.macroName) {
    for (let i = 0; i < state.length; i++) {
      if (!newState.stages.includes(clonedState[i].name)) {
        clonedState[i].disabled = true;
      }
    }
  }

  if (newState.stageStatus[0] === newState.macroName) {
    const states = newState.stageStatus.slice(1).map((x) => x.trim());
    let cancelled = false;
    for (let n = 0; n < states.length; n = n + 2) {
      const name: string = states[n];
      const state: string = states[n + 1];
      for (let i = 0; i < clonedState.length; i++) {
        if (clonedState[i].name === name) {
          if (state === 'finished') {
            clonedState[i].completed = true;
          } else if (state === 'cancelled') {
            if (!cancelled) {
              clonedState[i].failed = true;
              clonedState[i].cancelled = true;
              cancelled = true;
            }
          } else if (state === 'failed') {
            clonedState[i].failed = true;
          } else if (state === 'active') {
            clonedState[i].active = true;
          } else if (state === 'waiting') {
            clonedState[i].active = false;
            clonedState[i].completed = false;
            clonedState[i].failed = false;
          }
        }
      }
    }
  }

  return clonedState;
}

export default function MacroStepper({ macroName, ...props }: MacroStepperProps) {
  const halKeywords = React.useContext(HALContext);
  const thisMacroData = (macroData as IMacroData)[macroName];

  const initialStageState: StageState[] = [];

  thisMacroData.stages.forEach((stageName, iStep) => {
    let description: string;
    if (thisMacroData.descriptions && thisMacroData.descriptions[stageName]) {
      description = thisMacroData.descriptions[stageName];
    } else {
      description = capitalize(stageName);
    }

    initialStageState.push({
      name: stageName,
      description: description,
      index: iStep,
      active: false,
      completed: false,
      disabled: false,
      failed: false,
      cancelled: false
    });
  });

  const [stageState, setStageState] = React.useReducer(updateStageState, initialStageState);

  const stagesKw = halKeywords['hal.stages'];
  const stageStatusKw = halKeywords['hal.stage_status'];

  // Here we just check if the keyword change has something useful and if so call the reducer.
  React.useEffect(() => {
    if (
      !stagesKw ||
      !stageStatusKw ||
      stagesKw.values[0] !== macroName ||
      stageStatusKw.values[0] !== macroName
    )
      return;

    setStageState({
      macroName: macroName,
      stages: stagesKw.values,
      stageStatus: stageStatusKw.values
    });
  }, [stageStatusKw, stagesKw, macroName]);

  return (
    <Box overflow='scroll' width='100%' pt={1}>
      <Stepper alternativeLabel>
        {stageState.map((step) => (
          <Step
            key={step.name}
            index={step.index}
            active={step.active}
            completed={step.completed}
            disabled={step.disabled}
          >
            <StepLabel error={step.failed}>{step.description}</StepLabel>
          </Step>
        ))}
        <Step
          index={stageState.length}
          completed={stageState.every((stage) => stage.completed === true)}
        >
          <StepLabel>Done</StepLabel>
        </Step>
      </Stepper>
    </Box>
  );
}
