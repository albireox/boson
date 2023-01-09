/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-08
 *  @Filename: Auto.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import IOSSwitch from 'renderer/Components/IOSwitch';
import useIsMacroRunning from './useIsMacroRunning';

export default function AutoMode() {
  const macroName = 'auto';

  const [count, setCount] = React.useState('1');

  const isRunning = useIsMacroRunning(macroName);

  const modifyCount = React.useCallback(() => {
    if (isRunning) {
      // Modify command.
      const commandString = `hal auto --modify --count ${count}`;
      window.electron.tron.send(commandString);
    }
  }, [isRunning, count]);

  const handleCountKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        modifyCount();
      }
    },
    [modifyCount]
  );

  React.useEffect(() => {
    const timeout = setTimeout(modifyCount, 2000);
    return () => clearTimeout(timeout);
  }, [count, modifyCount]);

  const handleSwitch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      let commandString: string;
      if (isRunning) {
        commandString = 'hal auto --stop';
      } else {
        commandString = `hal auto --count ${count}`;
      }
      window.electron.tron.send(commandString);
    },
    [isRunning, count]
  );

  return (
    <Paper variant='outlined'>
      <Stack alignItems='center' direction='row' spacing={8} p={1.5} px={2}>
        <Typography variant='h6'>Auto Mode</Typography>
        <Box flexGrow={1} />
        <TextField
          label='Count'
          size='small'
          type='number'
          variant='standard'
          value={count}
          onChange={(e) => setCount(e.target.value)}
          onKeyDown={handleCountKeyDown}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            width: '40px',
            '& .MuiInputBase-root': { marginTop: 1 },
          }}
        />

        <IOSSwitch checked={isRunning} onChange={handleSwitch} />
      </Stack>
    </Paper>
  );
}
