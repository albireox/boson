/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-10
 *  @Filename: goto_field.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { CommandButton } from 'renderer/Components';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import { useKeywords } from 'renderer/hooks';
import { ExposureTimeInput } from '.';
import { MacroStageSelect } from './Components/MacroStageSelect';
import macros from './macros.json';
import MacroStepper from './MacroStepper';
import useIsMacroRunning from './useIsMacroRunning';

export default function GotoField() {
  const macroName = 'goto_field';

  const [guiderTime, setGuiderTime] = React.useState(
    macros.goto_field.defaults.guider_time.toString()
  );
  const [fixedAltAz, setFixedAltAz] = React.useState(false);
  const [keepOffsets, setKeepOffsets] = React.useState(true);
  const [commandString, setCommandString] = React.useState('hal goto-field');

  const isRunning = useIsMacroRunning(macroName);

  const { configuration_loaded: configurationLoadedKw } = useKeywords(
    'jaeger',
    ['configuration_loaded']
  );

  const updateCommandString = (stages: string[]) => {
    if (stages.length === 0) {
      setCommandString('hal goto-field');
    } else {
      const joinedStages = stages.join(',');
      setCommandString(`hal goto-field -s ${joinedStages}`);
    }
  };

  const getCommandString = () => {
    let cmdString = `${commandString} --guider-time ${guiderTime || 15}`;
    if (fixedAltAz) {
      cmdString += ' --fixed-altaz';
    }
    if (keepOffsets) {
      cmdString += ' --keep-offsets';
    } else {
      cmdString += ' --no-keep-offsets';
    }
    return cmdString;
  };

  const checkConfiguration = async () => {
    // If the design is cloned, show a confirmation dialog.

    if (!configurationLoadedKw) {
      await window.electron.dialog.showErrorBox(
        'Error',
        'Please, load a design first.'
      );
      return false;
    }

    if (configurationLoadedKw.values[9]) {
      const result = await window.electron.dialog.showMessageBox({
        message: 'Confirm go to field',
        type: 'question',
        detail:
          'The configuration loaded has been cloned from a previous ' +
          'configuration. Are you sure that you want to go to field?',
        buttons: ['No', 'Yes'],
      });

      if (result.response === 1) {
        return true;
      }
      return null;
    }

    return true;
  };

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
          <FormControlLabel
            control={
              <Checkbox
                sx={{ pl: 0 }}
                checked={fixedAltAz}
                disableRipple
                onChange={(e) => setFixedAltAz(e.target.checked)}
                size='small'
              />
            }
            label='Fix Alt/Az'
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{ pl: 0 }}
                checked={keepOffsets}
                disableRipple
                onChange={(e) => setKeepOffsets(e.target.checked)}
                size='small'
              />
            }
            label='Keep Offsets'
          />
          <Box flexGrow={1} />
          <CommandWrapper
            commandString={getCommandString()}
            beforeCallback={checkConfiguration}
            isRunning={isRunning}
            abortCommand='hal goto-field --stop'
          >
            <CommandButton variant='outlined' endIcon={<SendIcon />}>
              Run
            </CommandButton>
          </CommandWrapper>
        </Stack>
        <Stack
          alignItems='center'
          direction='row'
          spacing={2}
          overflow='scroll'
        >
          <MacroStepper macroName={macroName} />
        </Stack>
      </Stack>
    </Paper>
  );
}
