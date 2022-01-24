/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-10
 *  @Filename: goto_field.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { CommandButton } from 'renderer/components/commandButton';
import { MacroStageSelect } from 'renderer/components/macroStageSelect';
import { ExposureTimeInput } from '.';
import macros from './macros.json';
import MacroStepper from './macro_stepper';

/** @jsxImportSource @emotion/react */

export default function GotoFieldView(): JSX.Element | null {
  const [guiderTime, setGuiderTime] = React.useState<any>(macros.goto_field.defaults.guider_time);
  const [commandString, setCommandString] = React.useState('hal goto-field');

  const updateCommandString = (stages: string[]) => {
    if (stages.length === 0) {
      setCommandString('hal goto-field');
    } else {
      setCommandString('hal goto-field -s ' + stages.join(','));
    }
  };

  return (
    <Paper variant='outlined' key='aaa'>
      <Stack
        direction='column'
        divider={<Divider variant='middle' sx={{ opacity: 0.8 }} />}
        width='100%'
        p={1}
        px={2}
        spacing={1}
        key='a'
      >
        <Stack alignItems='center' direction='row' spacing={2} key='b'>
          <Typography variant='h6'>Goto Field</Typography>
          <MacroStageSelect
            stages={macros.goto_field.stages}
            maxWidth={200}
            minWidth={100}
            onStagesSelected={updateCommandString}
          />
          <ExposureTimeInput
            label='Guider Exp. Time'
            value={guiderTime}
            onChange={(e) => setGuiderTime(e.target.value)}
          />
          <Box flexGrow={1} />
          <CommandButton
            commandString={`${commandString} --guider-time ${guiderTime || 15}`}
            abortCommand='hal goto-field --stop'
            size='medium'
          >
            Run
          </CommandButton>
        </Stack>
        <Stack alignItems='center' direction='row' spacing={2} overflow='scroll'>
          <MacroStepper macroName='goto_field' />
        </Stack>
      </Stack>
    </Paper>
  );
}
