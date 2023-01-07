/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: scripts.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SendIcon from '@mui/icons-material/Send';
import { Box, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { CommandStatus, ReplyCode } from 'main/tron/types';
import React from 'react';
import { CommandButton } from 'renderer/Components';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import { useKeywordContext } from 'renderer/hooks';
import BorderLinearProgress from './Components/BorderLinealProgress';

export default function Scripts() {
  const halKeywords = useKeywordContext();

  const { available_scripts: availableScriptsKw, scrip_step: scripStepKw } =
    halKeywords;

  const [scripts, setScripts] = React.useState<string[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [selectorDisabled, setSelectorDisabled] = React.useState(false);
  const [selectedScript, setSelectedScript] = React.useState<string>('');
  const [steps, setSteps] = React.useState<string[]>([]);

  const handleScriptChange = (newScript: string) => {
    setSelectedScript(newScript);
    window.electron.tron
      .send(`hal script get-steps ${newScript}`)
      .then((command) => {
        if (command.status === CommandStatus.Done) {
          const stepsTmp: string[] = [];
          command.replies.forEach((reply) => {
            if (reply.code === ReplyCode.Info) {
              reply.keywords.forEach((kw) => {
                if (kw.name === 'text') {
                  stepsTmp.push(kw.values[0]);
                }
              });
            }
          });
          setSteps(stepsTmp);
          setProgress(0);
        }
        return true;
      })
      .catch(() => {});
  };

  const checkRunning = async () => {
    const command = await window.electron.tron.send('hal script running');
    const runningCommands = command.replies
      .reverse()[0]
      .getKeyword('running_scripts');
    if (runningCommands && runningCommands.values.includes(selectedScript))
      return false;
    setProgress(0);
    return true;
  };

  const handleScriptEvent = (event: string) => {
    return event === 'running'
      ? setSelectorDisabled(true)
      : setSelectorDisabled(false);
  };

  React.useEffect(() => {
    if (!availableScriptsKw) return;

    setScripts(availableScriptsKw.values);
  }, [availableScriptsKw]);

  React.useEffect(() => {
    if (availableScriptsKw && selectedScript === '') {
      const sortedScripts = availableScriptsKw.values.sort();
      setSelectedScript(sortedScripts[0]);
      handleScriptChange(sortedScripts[0]);
    }
  }, [availableScriptsKw, selectedScript]);

  React.useEffect(() => {
    if (!scripStepKw) return;

    const values = scripStepKw.values as [string, string, number, number];
    if (values[0] !== selectedScript) return;

    setProgress(values[2]);
  }, [scripStepKw, selectedScript]);

  return (
    <Paper variant='outlined'>
      <Stack p={1} alignItems='center' direction='row' spacing={2} px={2}>
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

        <CommandWrapper
          commandString={`hal script run ${selectedScript}`}
          abortCommand={`hal script cancel ${selectedScript}`}
          beforeCallback={checkRunning}
          onStatusChange={handleScriptEvent}
        >
          <CommandButton variant='outlined' endIcon={<SendIcon />}>
            Run
          </CommandButton>
        </CommandWrapper>
      </Stack>
    </Paper>
  );
}
