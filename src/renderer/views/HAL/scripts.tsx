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

  const script_step = keywords['hal.script_step'];

  const [progress, setProgress] = React.useState(0);
  const [selectorDisabled, setSelectorDisabled] = React.useState(false);
  const [selectedScript, setSelectedScript] = React.useState<string>('');
  const [steps, setSteps] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (available_scripts && selectedScript === '') {
      const sortedScripts = available_scripts.values.sort();
      setSelectedScript(sortedScripts[0]);
      handleScriptChange(sortedScripts[0]);
    }
  }, [available_scripts, selectedScript]);

  React.useEffect(() => {
    if (!script_step) return;

    const values = script_step.values as [string, string, number, number];
    if (values[0] !== selectedScript) return;

    setProgress(values[2]);
  }, [script_step, selectedScript]);

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
        setProgress(0);
      }
    });
  };

  async function checkRunning() {
    let command = await window.api.tron.send('hal script running');
    let running_commands = command.replies.reverse()[0].keywords['running_scripts'].values;
    if (running_commands.includes(selectedScript)) return false;
    setProgress(0);
    return true;
  }

  const handleScriptEvent = (event: string) => {
    event === 'running' ? setSelectorDisabled(true) : setSelectorDisabled(false);
  };

  return (
    <Paper variant='outlined'>
      <Stack p={1} alignItems='center' direction='row' spacing={2}>
        <Typography variant='h6'>Scripts</Typography>
        <Select
          size='small'
          value={selectedScript}
          onChange={(e) => handleScriptChange(e.target.value)}
          disabled={selectorDisabled}
        >
          {scripts.map((script: string) => (
            <MenuItem key={script} value={script}>
              {script}
            </MenuItem>
          ))}
        </Select>
        <Box flex={1} display='flex' alignItems='center' flexDirection='row'>
          <BorderLinearProgress
            variant='determinate'
            value={(progress / steps.length) * 100}
            sx={{ flexGrow: 1 }}
          />
          <Typography pl={1}>
            {progress} / {steps.length}
          </Typography>
        </Box>
        <CommandButton
          commandString={`hal script run ${selectedScript}`}
          abortCommand={`hal script cancel ${selectedScript}`}
          size='medium'
          beforeCallback={checkRunning}
          onEvent={handleScriptEvent}
        >
          Run
        </CommandButton>
      </Stack>
    </Paper>
  );
}
