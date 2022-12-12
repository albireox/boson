/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-01-16
 *  @Filename: expose.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  LinearProgressProps,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { round } from 'lodash';
import React from 'react';
import { CommandButton } from 'renderer/Components';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import { useStore } from 'renderer/hooks';
import { ExposureTimeInput, HALContext } from '.';
import { MacroStageSelect } from './Components/MacroStageSelect';
import macros from './macros.json';
import MacroStepper from './MacroStepper';
import useIsMacroRunning from './useIsMacroRunning';

function getTAITime() {
  // TODO: replace this with a proper TAI or with a useElapsedTime
  const now = new Date();
  return new Date(now.getTime() + 37000);
}

interface LinearProgressWithLabelProps extends LinearProgressProps {
  total: number;
  etr?: number;
  header?: string;
  suffix?: string;
}

function LinearProgressWithLabel(props: LinearProgressWithLabelProps) {
  const { total, etr, header, suffix } = props;

  const [etrDisplay, setEtrDisplay] = React.useState(etr || total);
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(
      () => setEtrDisplay((etrD) => (etrD - 1 <= 0 ? 0 : etrD - 1)),
      1000
    );
    return () => {
      clearInterval(interval);
    };
  }, []);

  React.useEffect(() => {
    setEtrDisplay(!etr || etr <= 0 ? 0 : etr);
  }, [etr]);

  React.useEffect(() => {
    let calculatedValue = ((total - etrDisplay) / total) * 100;
    if (calculatedValue > 100) calculatedValue = 100;
    if (calculatedValue < 0) calculatedValue = 0;
    setValue(calculatedValue);
  }, [etrDisplay, total]);

  return (
    <Stack direction='row' alignItems='center' spacing={1}>
      <Stack>
        <Typography variant='body2' color='text.secondary'>
          {header}
        </Typography>
      </Stack>
      <Stack flexGrow={1}>
        <LinearProgress variant='determinate' value={value} {...props} />
      </Stack>
      <Stack>
        <Typography variant='body2' color='text.secondary'>{`${round(
          etrDisplay || 0,
          0
        )}s ${suffix}`}</Typography>
      </Stack>
    </Stack>
  );
}

export default function Expose() {
  const macroName = 'expose';

  const [apogeeReads, setApogeeReads] = React.useState<string>(
    macros.expose.defaults.apogee_reads.toString()
  );
  const [bossTime, setBossTime] = React.useState<string>(
    macros.expose.defaults.boss_exptime.toString()
  );
  const [count, setCount] = React.useState<string>(
    macros.expose.defaults.count.toString()
  );
  const [pairs, setPairs] = React.useState<boolean>(
    macros.expose.defaults.pairs
  );

  const isRunning = useIsMacroRunning(macroName);

  const [observatory] = useStore<'APO' | 'LCO'>('connection.observatory');

  const [stages, setStages] = React.useState<string[]>([]);
  const [actorStages, setActorStages] = React.useState<string[]>([]);

  const [apogeeProgress, setApogeeProgress] = React.useState(<span />);
  const [bossProgress, setBossProgress] = React.useState(<span />);

  const [detail, setDetail] = React.useState(<span />);

  const halKeywords = React.useContext(HALContext);

  const { exposure_state_apogee: apogeeStateKw } = halKeywords;
  const { exposure_state_boss: bossStateKw } = halKeywords;
  const { stages: stagesKw } = halKeywords;
  const { running_macros: runningMacrosKw } = halKeywords;

  const getCommandString = () => {
    const commandString: string[] = ['hal expose'];
    const joinedStages = stages.join(',');

    if (stages.length > 0) commandString.push(`-s ${joinedStages}`);

    if (pairs) {
      commandString.push('--pairs');
    } else {
      commandString.push('--no-pairs');
    }

    if (stages.length === 0 || stages.includes('expose_boss')) {
      commandString.push(
        `-b ${bossTime || macros.expose.defaults.boss_exptime}`
      );
    } else {
      commandString.push(
        `--reads ${apogeeReads || macros.expose.defaults.apogee_reads}`
      );
    }

    commandString.push(`--count ${count || macros.expose.defaults.count}`);

    return commandString.join(' ');
  };

  React.useEffect(() => {
    // Calculate approximate exposure times.

    let bossDetail = '';
    let apogeeDetail = '';

    const bossOverhead = observatory === 'APO' ? 80 : 40;
    const bossReadout = observatory === 'APO' ? 67 : 35;

    const type = pairs ? 'pair(s)' : 'exposure(s)';

    const nExp = parseInt(count || macros.expose.defaults.count.toString(), 10);

    if (stages.length === 0 || stages.includes('expose_boss')) {
      const bossExpTime = parseFloat(
        bossTime || macros.expose.defaults.boss_exptime.toString()
      );
      const bossTotal = nExp * (bossExpTime + bossOverhead);

      bossDetail = `BOSS: ~${round(bossTotal, 0)} s (${nExp}x${round(
        bossExpTime,
        0
      )})`;

      if (stages.length === 0 || stages.includes('expose_apogee')) {
        apogeeDetail = `APOGEE: ~${round(
          bossTotal - bossReadout,
          0
        )} s (${nExp} ${type})`;
      }
    } else {
      let apogeeTotal =
        nExp *
        10.6 *
        parseInt(
          apogeeReads || macros.expose.defaults.apogee_reads.toString(),
          10
        );
      if (pairs) apogeeTotal *= 2;

      apogeeDetail = `APOGEE: ~${round(apogeeTotal, 0)} s (${nExp} ${type})`;
    }

    setDetail(
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1 }}>
        {bossDetail && (
          <Grid item xs={apogeeDetail && bossDetail ? 6 : 12}>
            {bossDetail}
          </Grid>
        )}
        {apogeeDetail && (
          <Grid item xs={apogeeDetail && bossDetail ? 6 : 12}>
            {apogeeDetail}
          </Grid>
        )}
      </Grid>
    );
  }, [stages, apogeeReads, bossTime, count, pairs, observatory]);

  React.useEffect(() => {
    if (stagesKw && stagesKw.values[0] === 'expose')
      setActorStages(stagesKw.values.slice(1));
  }, [stagesKw]);

  React.useEffect(() => {
    // Create and update the BOSS progress bar. This only depend on actor keywords.

    let progress: JSX.Element | null = null;

    if (actorStages.length === 0 || actorStages.includes('expose_boss')) {
      if (bossStateKw) {
        const bossState = bossStateKw.values;
        const bossTotal = bossState[3];
        const bossTimestamp = bossState[4];
        const bossDeltaT = getTAITime().getTime() / 1000 - bossTimestamp;
        const bossEtr = bossState[2] - bossDeltaT;

        progress = (
          <LinearProgressWithLabel
            total={bossTotal}
            etr={bossEtr}
            header='BOSS'
            suffix={`(${bossState[0]}/${bossState[1]})`}
          />
        );
      }
    }

    setBossProgress(
      progress ? (
        <Grid item xs={actorStages.includes('expose_apogee') ? 6 : 12}>
          {progress}
        </Grid>
      ) : (
        <span />
      )
    );
  }, [actorStages, bossStateKw]);

  React.useEffect(() => {
    // Create and update the APOGEE progress bars. This only depend on actor keywords.

    let progress: JSX.Element | null = null;

    if (actorStages.length === 0 || actorStages.includes('expose_apogee')) {
      if (apogeeStateKw) {
        const apogeeState = apogeeStateKw.values;
        const apogeeTotal = apogeeState[5];
        const apogeeTimestamp = apogeeState[6];
        const apogeeDeltaT = getTAITime().getTime() / 1000 - apogeeTimestamp;
        const apogeeEtr = apogeeState[4] - apogeeDeltaT;

        progress = (
          <LinearProgressWithLabel
            color='secondary'
            total={apogeeTotal}
            etr={apogeeEtr}
            header='APOGEE'
            suffix={`(${apogeeState[0]}/${apogeeState[1]}) ${apogeeState[3]}`}
          />
        );
      }
    }

    setApogeeProgress(
      progress ? (
        <Grid item xs={actorStages.includes('expose_boss') ? 6 : 12}>
          {progress}
        </Grid>
      ) : (
        <span />
      )
    );
  }, [actorStages, apogeeStateKw]);

  return (
    <Paper variant='outlined'>
      <Stack
        direction='column'
        divider={<Divider variant='middle' sx={{ opacity: 0.8 }} />}
        p={1}
        px={2}
        spacing={1}
      >
        <Stack alignItems='center' direction='row' spacing={2}>
          <Typography variant='h6'>Expose</Typography>
          <MacroStageSelect
            stages={macros.expose.stages}
            maxWidth={200}
            minWidth={100}
            onStagesSelected={(stgs) => setStages(stgs)}
          />
          <Stack
            alignItems='center'
            direction='row'
            spacing={2}
            flexWrap='wrap'
            justifyContent='center'
          >
            {(stages.length === 0 || stages.includes('expose_boss')) && (
              <ExposureTimeInput
                label='BOSS Exp Time'
                value={bossTime}
                onChange={(e) => {
                  e.preventDefault();
                  setBossTime(e.target.value);
                }}
              />
            )}
            {!stages.includes('expose_boss') &&
              stages.includes('expose_apogee') && (
                <TextField
                  label='AP reads'
                  type='number'
                  size='small'
                  variant='standard'
                  value={apogeeReads}
                  onChange={(e) => {
                    e.preventDefault();
                    setApogeeReads(e.target.value);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    width: '80px',
                    '& .MuiInputBase-root': { marginTop: 1 },
                  }}
                />
              )}
            <TextField
              label='Count'
              size='small'
              type='number'
              variant='standard'
              value={count}
              onChange={(e) => setCount(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                width: '60px',
                '& .MuiInputBase-root': { marginTop: 1 },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  sx={{ pl: 0 }}
                  checked={pairs}
                  disableRipple
                  onChange={(e) => setPairs(e.target.checked)}
                  size='small'
                />
              }
              label='Pairs'
            />
          </Stack>
          <Box flexGrow={1} />
          <CommandWrapper
            commandString={getCommandString()}
            abortCommand='hal expose --stop'
            isRunning={isRunning}
          >
            <CommandButton variant='outlined' endIcon={<SendIcon />}>
              Run
            </CommandButton>
          </CommandWrapper>
        </Stack>
        <Stack alignItems='center' textAlign='center' spacing={4}>
          {runningMacrosKw && runningMacrosKw.values.includes('expose') ? (
            <Grid container rowSpacing={1} columnSpacing={{ xs: 2 }}>
              {bossProgress} {apogeeProgress}
            </Grid>
          ) : (
            detail
          )}
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
    </Paper>
  );
}
