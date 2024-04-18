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
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import { CommandButton } from 'renderer/Components';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import { useIsExposing, useKeywordContext, useStore } from 'renderer/hooks';
import useIsMacroRunning from 'renderer/hooks/useIsMacroRunning';
import { ExposureTimeInput } from './Components/ExposureTimeInput';
import MacroPaper from './Components/MacroPaper';
import { MacroStageSelect } from './Components/MacroStageSelect';
import MacroStepper from './Components/MacroStepper';
import macros from './macros.json';

export default function GotoField() {
  const macroName = 'goto_field';

  const [useAutoMode] = useStore<boolean>('hal.allowGotoFieldAutoMode');

  const [guiderTime, setGuiderTime] = React.useState(
    macros.goto_field.defaults.guider_time.toString()
  );
  const [fixedAltAz, setFixedAltAz] = React.useState(false);
  const [hartmann, setHartmann] = React.useState(false);
  const [keepOffsets, setKeepOffsets] = React.useState(true);
  const [commandString, setCommandString] = React.useState('hal goto-field');

  const isLarge = useMediaQuery('(min-width: 720px)');

  const isRunning = useIsMacroRunning(macroName);
  const isExposing = useIsExposing();

  const halKeywords = useKeywordContext();
  const { configuration_loaded: configurationLoadedKw } = halKeywords;

  const updateCommandString = React.useCallback((stages: string[]) => {
    if (stages.length === 0) {
      setCommandString('hal goto-field');
    } else if (stages.includes('auto')) {
      setCommandString('hal goto-field --auto');
    } else {
      const joinedStages = stages.join(',');
      setCommandString(`hal goto-field -s ${joinedStages}`);
    }
  }, []);

  const getCommandString = React.useCallback(() => {
    let cmdString = commandString;
    if (guiderTime.trim() !== '') {
      cmdString += ` --guider-time ${guiderTime.trim()}`;
    }
    if (fixedAltAz) {
      cmdString += ' --fixed-altaz';
    }
    if (keepOffsets) {
      cmdString += ' --keep-offsets';
    } else {
      cmdString += ' --no-keep-offsets';
    }
    if (hartmann) {
      cmdString += ' --with-hartmann';
    }
    return cmdString;
  }, [guiderTime, fixedAltAz, keepOffsets, hartmann, commandString]);

  const checkConfiguration = React.useCallback(async () => {
    // If the design is cloned, show a confirmation dialog.

    if (!configurationLoadedKw) {
      await window.electron.dialog.showErrorBox(
        'Error',
        'Please, load a design first.'
      );
      return false;
    }

    if (isExposing) {
      const result = await window.electron.dialog.showMessageBox({
        message: 'Confirm go to field',
        type: 'question',
        detail:
          'One or more exposures are currently running. ' +
          'Are you sure you want to go to field?',
        buttons: ['No', 'Yes'],
      });

      if (result.response !== 1) {
        return null;
      }
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

      if (result.response !== 1) {
        return null;
      }
    }

    return true;
  }, [configurationLoadedKw, isExposing]);

  return (
    <MacroPaper>
      <Stack
        direction='column'
        divider={<Divider variant='middle' sx={{ opacity: 0.8 }} />}
        width='100%'
        p={1}
        px={2}
        spacing={1}
      >
        <Stack alignItems='center' direction='row' spacing={2}>
          <Typography variant='h6' whiteSpace='nowrap'>
            Goto Field
          </Typography>
          <MacroStageSelect
            macro={macroName}
            autoMode={useAutoMode}
            maxWidth={300}
            minWidth={100}
            onStagesSelected={updateCommandString}
          />
          <ExposureTimeInput
            label='Guider Exp. Time'
            value={guiderTime}
            onChange={(e) => setGuiderTime(e.target.value)}
            isNumber={false}
          />
          <FormControlLabel
            control={
              useAutoMode ? (
                <Checkbox
                  sx={{ pl: 0 }}
                  checked={hartmann}
                  disableRipple
                  onChange={(e) => setHartmann(e.target.checked)}
                  size='small'
                />
              ) : (
                <Checkbox
                  sx={{ pl: 0 }}
                  checked={fixedAltAz}
                  disableRipple
                  onChange={(e) => setFixedAltAz(e.target.checked)}
                  size='small'
                />
              )
            }
            label={useAutoMode ? 'Hartmann' : 'Fix Alt/Az'}
            sx={{ display: isLarge ? 'inherit' : 'none' }}
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
            label='Offsets'
            sx={{ '& .MuiFormControlLabel-label': { whiteSpace: 'nowrap' } }}
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
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
          }}
        >
          <MacroStepper macroName={macroName} />
        </Stack>
      </Stack>
    </MacroPaper>
  );
}
