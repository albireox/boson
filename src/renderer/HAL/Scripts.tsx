/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: scripts.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SendIcon from '@mui/icons-material/Send';
import { Collapse, MenuItem, Select, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { CommandStatus, ReplyCode } from 'main/tron/types';
import React from 'react';
import { CommandButton } from 'renderer/Components';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import { useKeywordContext } from 'renderer/hooks';
import BorderLinearProgress from './Components/BorderLinealProgress';
import MacroPaper from './Components/MacroPaper';

interface StepProgressProps {
  progress: number;
  steps: string[];
  stepValue?: string;
}

function StepProgress(props: StepProgressProps) {
  const { progress, steps, stepValue } = props;

  return (
    <Stack direction='column' spacing={0.5} pt={1} flexGrow={1}>
      <Stack direction='row' spacing={1} flexGrow={1}>
        <BorderLinearProgress
          variant='determinate'
          value={(progress / steps.length) * 100}
          sx={{ flexGrow: 1, alignSelf: 'center' }}
        />
        <Typography>
          {progress} / {steps.length}
        </Typography>
      </Stack>
      <Collapse in={stepValue !== ''} timeout={500}>
        <Typography variant='body1' textAlign='center'>
          {stepValue}
        </Typography>
      </Collapse>
    </Stack>
  );
}

export default function Scripts() {
  const halKeywords = useKeywordContext();

  const {
    'hal.available_scripts': availableScriptsKw,
    'hal.script_step': scripStepKw,
    'hal.running_scripts': runningScriptsKw,
  } = halKeywords;

  const [progress, setProgress] = React.useState(0);

  const [scripts, setScripts] = React.useState<string[]>([]);
  const [selectedScript, setSelectedScript] = React.useState<string>('');
  const [runningScripts, setRunningScripts] = React.useState<string[]>([]);
  const [steps, setSteps] = React.useState<string[]>([]);
  const [currentStepValue, setCurrentStepValue] = React.useState('');

  const isRunning = runningScripts.length > 0;

  const handleScriptChange = React.useCallback(
    (newScript: string, resetProgress = true) => {
      setSelectedScript(newScript);
      window.electron.tron
        .send(`hal script get-steps ${newScript}`, false, true)
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
            if (resetProgress) setProgress(0);
          }
          return true;
        })
        .catch(() => {});
    },
    []
  );

  React.useEffect(() => {
    setScripts(availableScriptsKw?.values ?? []);
  }, [availableScriptsKw]);

  React.useEffect(() => {
    // Handle first render when selectedScript is not selected.

    if (availableScriptsKw && selectedScript === '') {
      const sortedScripts = availableScriptsKw.values.sort();
      setSelectedScript(sortedScripts[0]);
      handleScriptChange(sortedScripts[0]);
    }
  }, [availableScriptsKw, selectedScript, handleScriptChange]);

  React.useEffect(() => {
    // Handle new step in running script.

    if (!scripStepKw) return;

    const values = scripStepKw.values as [string, string, number, number];
    if (values[0] !== selectedScript) return;

    setProgress(values[2]);
    setCurrentStepValue(values[1]);
  }, [scripStepKw, selectedScript]);

  React.useEffect(() => {
    // If script is running, set the selected script to the currently running.
    // Technically hal script allows to run multiple scripts at the same time
    // but we assume just one is running.

    if (!runningScriptsKw) return;

    if (runningScriptsKw.values.length > 0) {
      handleScriptChange(runningScriptsKw.values[0], false);
    }
    setRunningScripts(runningScriptsKw.values);
  }, [runningScriptsKw, handleScriptChange]);

  return (
    <MacroPaper backcolor='#9C27B030'>
      <Stack
        alignItems='baseline'
        direction='row'
        spacing={2}
        px={2}
        py={2}
        width='100%'
      >
        <Typography variant='h6' whiteSpace='nowrap'>
          Scripts
        </Typography>
        <Select
          size='small'
          value={selectedScript}
          onChange={(e) => handleScriptChange(e.target.value)}
          disabled={isRunning}
        >
          {scripts.map((script: string) => (
            <MenuItem key={script} value={script}>
              {script}
            </MenuItem>
          ))}
        </Select>
        <StepProgress
          progress={progress}
          steps={steps}
          stepValue={isRunning ? currentStepValue : ''}
        />
        <Box>
          <CommandWrapper
            commandString={`hal script run ${selectedScript}`}
            abortCommand={`hal script cancel ${selectedScript}`}
            isRunning={isRunning}
          >
            <CommandButton variant='outlined' endIcon={<SendIcon />}>
              Run
            </CommandButton>
          </CommandWrapper>
        </Box>
      </Stack>
    </MacroPaper>
  );
}
