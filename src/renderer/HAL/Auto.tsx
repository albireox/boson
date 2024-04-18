/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-08
 *  @Filename: Auto.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import { Collapse, Paper, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import IOSSwitch from 'renderer/Components/IOSwitch';
import { useKeywordContext } from 'renderer/hooks';
import useIsMacroRunning from 'renderer/hooks/useIsMacroRunning';
import useStageStatus from 'renderer/hooks/useStageStatus';
import { ExposureTimeInput } from './Components/ExposureTimeInput';
import PauseResumeButton from './Components/PauseResumeButton';
import SnackAlert, { SnackAlertRefType } from './Components/SnackAlert';

export default function AutoMode() {
  const macroName = 'auto';

  const [count, setCount] = React.useState('1');
  const [preload, setPreload] = React.useState('300');

  const [error, setError] = React.useState(false);
  const [cancelled, setCancelled] = React.useState(false);

  const [message, setMessage] = React.useState();

  const { 'hal.auto_mode_message': autoModeMessageKw } = useKeywordContext();

  const isRunning = useIsMacroRunning(macroName);
  const stageStatus = useStageStatus(macroName);

  const snackCountRef = React.useRef<SnackAlertRefType>(null);

  let switchColor: 'success' | 'warning' | 'error';
  let switchDisabledColor: 'default' | 'error' | 'success' | 'warning';
  if (error) {
    switchColor = 'error';
    switchDisabledColor = 'error';
  } else if (cancelled) {
    switchColor = 'warning';
    switchDisabledColor = 'warning';
  } else {
    switchColor = 'success';
    switchDisabledColor = 'default';
  }

  React.useEffect(() => {
    setMessage(autoModeMessageKw?.values[0] ?? '');
  }, [autoModeMessageKw]);

  React.useEffect(() => {
    const { status } = stageStatus;
    const states = Array.from(status.values());

    setError(states.includes('failed') || states.includes('failing'));
    setCancelled(states.includes('cancelling') || states.includes('cancelled'));
  }, [stageStatus]);

  const modifyCount = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newCount = e.target.value;

      if (!isRunning) {
        setCount(newCount);
        return;
      }

      setCount(newCount);

      window.electron.tron
        .send(`hal auto --modify --count ${newCount}`)
        .then(() => {
          snackCountRef.current?.open();
          return true;
        })
        .catch(() => {
          snackCountRef.current?.open();
        });
    },
    [isRunning]
  );

  const handleSwitch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      let commandString: string;
      if (isRunning) {
        commandString = 'hal auto --stop';
      } else {
        commandString = `hal auto --preload-ahead ${preload} --count ${count}`;
      }
      window.electron.tron.send(commandString);
    },
    [isRunning, count]
  );

  return (
    <>
      <Paper variant='outlined'>
        <Stack alignItems='center' direction='row' p={1.5} px={2} spacing={2.5}>
          <Stack alignItems='center' direction='row' spacing={1}>
            <AirplanemodeActiveIcon />
            <Typography variant='h6' whiteSpace='nowrap'>
              Auto Pilot
            </Typography>
          </Stack>
          <Typography
            flexGrow={1}
            mx={3}
            variant='caption'
            textAlign='center'
            fontSize={15}
            whiteSpace='nowrap'
            color={error ? 'error' : undefined}
            sx={{ overflowX: 'scroll', overflowY: 'hidden' }}
          >
            {message}
          </Typography>
          <ExposureTimeInput
            label='Preload'
            value={preload}
            onChange={(e) => setPreload(e.target.value)}
            width='50px'
            isNumber={false}
            disabled={isRunning}
          />
          <TextField
            label='Count'
            size='small'
            type='number'
            variant='standard'
            value={count}
            onChange={modifyCount}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              minWidth: '35px',
              maxWidth: '35px',
              '& .MuiInputBase-root': {
                marginTop: 1,
                '& .MuiInput-input': { paddingTop: 0.5, paddingBottom: 0.1 },
              },
            }}
          />
          <Collapse orientation='horizontal' in={isRunning}>
            <PauseResumeButton macro='auto' />
          </Collapse>
          <IOSSwitch
            checked={isRunning}
            onChange={handleSwitch}
            color={switchColor}
            disabledColor={switchDisabledColor}
          />
        </Stack>
      </Paper>
      <SnackAlert
        ref={snackCountRef}
        message={`Expose count is now ${count}`}
        severity='info'
        showClose={false}
        autoHideDuration={3000}
      />
    </>
  );
}
