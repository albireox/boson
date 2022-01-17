/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-10
 *  @Filename: goto_field.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Divider, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { CommandButton } from 'renderer/components/commandButton';
import { MacroStageSelect } from 'renderer/components/macroStageSelect';
import { HALContext } from '.';
import macros from './macros.json';
import MacroStepper from './macro_stepper';

/** @jsxImportSource @emotion/react */

export default function GotoFieldView(): JSX.Element | null {
  const halKeywords = React.useContext(HALContext);
  const running_macros = halKeywords['hal.running_macros'];

  const [disabled, setDisabled] = React.useState(false);

  const [guiderTime, setGuiderTime] = React.useState(15);
  const [commandString, setCommandString] = React.useState('hal goto-field');

  const updateCommandString = (stages: string[]) => {
    if (stages.length === 0) {
      setCommandString('hal goto-field');
    } else {
      setCommandString('hal goto-field -s ' + stages.join(','));
    }
  };

  React.useEffect(() => {
    if (running_macros) {
      setDisabled(running_macros.values.includes('goto_field'));
    }
  }, [running_macros]);

  const GuiderTimeInput = () => (
    <TextField
      label='Guider time'
      size='small'
      InputProps={{ endAdornment: <InputAdornment position='end'>s</InputAdornment> }}
      variant='standard'
      value={guiderTime}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setGuiderTime(parseFloat(e.target.value));
      }}
      margin='dense'
      sx={{
        width: '80px',
        '& .MuiInputBase-root': { marginTop: 1 }
      }}
    />
  );

  return (
    <Paper variant='outlined'>
      <Stack
        direction='column'
        divider={<Divider variant='middle' sx={{ opacity: 0.8 }} />}
        width='100%'
        p={1}
        px={2}
        spacing={1}
      >
        <Stack alignItems='center' direction='row' spacing={2}>
          <Typography variant='h6'>Goto Field</Typography>
          <MacroStageSelect
            stages={macros['goto_field'].stages}
            maxWidth={200}
            minWidth={100}
            onStagesSelected={updateCommandString}
          />
          <GuiderTimeInput />
          <Box flexGrow={1} />
          <CommandButton
            disabled={disabled}
            commandString={`${commandString} --guider-time ${guiderTime}`}
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
