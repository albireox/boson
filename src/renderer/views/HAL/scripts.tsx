/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: scripts.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
/** @jsxImportSource @emotion/react */
import { styled } from '@mui/material/styles';
import { CommandStatus, KeywordMap, ReplyCode } from 'main/tron';
import React from 'react';
import { CommandButton } from 'renderer/components/commandButton';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800]
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'
  }
}));

interface IHALScripts {
  keywords: KeywordMap;
}

export default function HALScripts({ keywords }: IHALScripts): JSX.Element | null {
  const available_scripts = keywords['hal.available_scripts'];
  const scripts: string[] = !available_scripts ? [] : available_scripts.values;

  const [progress, setProgress] = React.useState(0);
  const [selectedScript, setSelectedScript] = React.useState<string>('');
  const [steps, setSteps] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (available_scripts && selectedScript === '') {
      setSelectedScript(available_scripts.values[0]);
      handleScriptChange(available_scripts.values[0]);
    }
  }, [available_scripts, selectedScript]);

  const handleScriptChange = (newScript: string) => {
    setSelectedScript(newScript);
    window.api.tron.send(`hal script get-steps ${newScript}`).then((reply) => {
      if (reply.status === CommandStatus.Done) {
        const stepsTmp: string[] = [];
        for (let idx in reply.replies) {
          if (reply.replies[idx].code === ReplyCode.Info) {
            stepsTmp.push(reply.replies[idx].keywords['text'].values[0]);
          }
        }
        setSteps(stepsTmp);
      }
    });
  };

  async function checkRunning() {
    let command = await window.api.tron.send('hal script running');
    let running_commands = command.replies.reverse()[0].keywords['running_scripts'].values;
    if (running_commands.includes(selectedScript)) return false;
    return true;
  }

  return (
    <Paper variant='outlined'>
      <Stack p={1} alignItems='center' direction='row' spacing={2}>
        <Typography variant='h6'>Scripts</Typography>
        <Select
          size='small'
          value={selectedScript}
          onChange={(e) => handleScriptChange(e.target.value)}
        >
          {scripts.map((script: string) => (
            <MenuItem key={script} value={script}>
              {script}
            </MenuItem>
          ))}
        </Select>
        <Box flex={1} display='flex' alignItems='center' flexDirection='row'>
          <BorderLinearProgress variant='determinate' value={progress} sx={{ flexGrow: 1 }} />
          <Typography pl={1}>0 / {steps.length}</Typography>
        </Box>
        <CommandButton commandString='hal status' size='medium' beforeCallback={checkRunning}>
          Run
        </CommandButton>
      </Stack>
    </Paper>
  );
}
