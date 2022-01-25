/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-01-16
 *  @Filename: expose.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

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
  Typography
} from '@mui/material';
import { round } from 'lodash';
import React from 'react';
import { CommandButton } from 'renderer/components/commandButton';
import { MacroStageSelect } from 'renderer/components/macroStageSelect';
import { ExposureTimeInput, HALContext } from '.';
import macros from './macros.json';
import MacroStepper from './macro_stepper';

/** @jsxImportSource @emotion/react */

function LinearProgressWithLabel(
  props: LinearProgressProps & {
    total: number;
    etr?: number;
    header?: string;
    suffix?: string;
  }
) {
  const [etrDisplay, setEtrDisplay] = React.useState(props.etr || props.total);
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(
      () => setEtrDisplay((etrDisplay) => (etrDisplay <= 0 ? 0 : etrDisplay - 1)),
      1000
    );
    return () => {
      clearInterval(interval);
    };
  }, []);

  React.useEffect(() => setEtrDisplay(props.etr || 0), [props.etr]);

  React.useEffect(() => {
    setValue(((props.total - etrDisplay) / props.total) * 100);
  }, [etrDisplay, props.total]);

  return (
    <Stack direction='row' alignItems='center' spacing={1}>
      <Stack>
        <Typography variant='body2' color='text.secondary'>
          {props.header}
        </Typography>
      </Stack>
      <Stack flexGrow={1}>
        <LinearProgress variant='determinate' value={value} {...props} />
      </Stack>
      <Stack>
        <Typography variant='body2' color='text.secondary'>{`${round(etrDisplay || 0, 0)}s ${
          props.suffix
        }`}</Typography>
      </Stack>
    </Stack>
  );
}

export default function ExposeView(): JSX.Element | null {
  const [apogeeReads, setApogeeReads] = React.useState<string>(
    macros.expose.defaults.apogee_reads.toString()
  );
  const [bossTime, setBossTime] = React.useState<string>(
    macros.expose.defaults.boss_exptime.toString()
  );
  const [count, setCount] = React.useState<string>(macros.expose.defaults.count.toString());
  const [pairs, setPairs] = React.useState<boolean>(macros.expose.defaults.pairs);

  const [stages, setStages] = React.useState<string[]>([]);
  const [actorStages, setActorStages] = React.useState<string[]>([]);

  const [progress, setProgress] = React.useState(<span />);
  const [detail, setDetail] = React.useState(<span />);

  const halKeywords = React.useContext(HALContext);

  const apogeeState = halKeywords['hal.exposure_state_apogee'];
  const bossState = halKeywords['hal.exposure_state_boss'];
  const stagesKey = halKeywords['hal.stages'];
  const runningMacros = halKeywords['hal.running_macros'];

  const getCommandString = () => {
    let commandString: string[] = ['hal expose'];

    if (stages.length > 0) commandString.push('-s ' + stages.join(','));

    if (pairs) {
      commandString.push('--pairs');
    } else {
      commandString.push('--no-pairs');
    }

    if (stages.length === 0 || stages.includes('expose_boss')) {
      commandString.push(`-b ${bossTime || macros.expose.defaults.boss_exptime}`);
    } else {
      commandString.push(`--reads ${apogeeReads || macros.expose.defaults.apogee_reads}`);
    }

    commandString.push(`--count ${count || macros.expose.defaults.count}`);

    return commandString.join(' ');
  };

  React.useEffect(() => {
    // Calculate approximate exposure times.

    let bossDetail = '';
    let apogeeDetail = '';

    const type = pairs ? 'pair(s)' : 'exposure(s)';

    const nExp = parseInt(count || macros.expose.defaults.count.toString());

    if (stages.length === 0 || stages.includes('expose_boss')) {
      const bossExpTime = parseFloat(bossTime || macros.expose.defaults.boss_exptime.toString());
      const bossTotal = nExp * (bossExpTime + 80);

      bossDetail = `BOSS: ~${round(bossTotal, 0)} s (${nExp}x${round(bossExpTime, 0)})`;

      if (stages.length === 0 || stages.includes('expose_apogee')) {
        apogeeDetail = `APOGEE: ~${round(bossTotal - 67, 0)} s (${nExp} ${type})`;
      }
    } else {
      let apogeeTotal =
        nExp * 10.6 * parseInt(apogeeReads || macros.expose.defaults.apogee_reads.toString());
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
  }, [stages, apogeeReads, bossTime, count, pairs]);

  React.useEffect(() => {
    if (stagesKey && stagesKey.values[0] === 'expose') setActorStages(stagesKey.values.slice(1));
  }, [stagesKey]);

  React.useEffect(() => {
    // Create and update progress bars. This only depend on actor keywords.

    if (!runningMacros) return;

    let apogeeProgress: JSX.Element | undefined = undefined;
    let bossProgress: JSX.Element | undefined = undefined;

    if (actorStages.length === 0 || actorStages.includes('expose_boss')) {
      if (bossState) {
        const boss_state = bossState.values;
        const boss_total = boss_state[3];
        const boss_etr = boss_state[2];

        bossProgress = (
          <LinearProgressWithLabel
            total={boss_total}
            etr={boss_etr}
            header='BOSS'
            suffix={`(${boss_state[0]}/${boss_state[1]})`}
          />
        );
      }
    }

    if (actorStages.length === 0 || actorStages.includes('expose_apogee')) {
      if (apogeeState) {
        const apogee_state = apogeeState.values;
        const apogee_total = apogee_state[5];
        const apogee_etr = apogee_state[4];

        apogeeProgress = (
          <LinearProgressWithLabel
            color='secondary'
            total={apogee_total}
            etr={apogee_etr}
            header='APOGEE'
            suffix={`(${apogee_state[0]}/${apogee_state[1]}) ${apogee_state[3]}`}
          />
        );
      }
    }

    setProgress(
      <Grid container rowSpacing={1} columnSpacing={{ xs: 2 }}>
        {bossProgress && (
          <Grid item xs={apogeeProgress && bossProgress ? 6 : 12}>
            {bossProgress}
          </Grid>
        )}
        {apogeeProgress && (
          <Grid item xs={apogeeProgress && bossProgress ? 6 : 12}>
            {apogeeProgress}
          </Grid>
        )}
      </Grid>
    );
  }, [actorStages, apogeeState, bossState, runningMacros]);

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
            flexWrap={'wrap'}
            justifyContent={'center'}
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
            {!stages.includes('expose_boss') && stages.includes('expose_apogee') && (
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
                  shrink: true
                }}
                sx={{
                  width: '80px',
                  '& .MuiInputBase-root': { marginTop: 1 }
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
                shrink: true
              }}
              sx={{
                width: '60px',
                '& .MuiInputBase-root': { marginTop: 1 }
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
          <CommandButton
            commandString={getCommandString()}
            abortCommand='hal expose --stop'
            size='medium'
          >
            Run
          </CommandButton>
        </Stack>
        <Stack alignItems='center' textAlign='center' spacing={4}>
          {runningMacros && runningMacros.values.includes('expose') ? progress : detail}
        </Stack>
        <Stack alignItems='center' direction='row' spacing={2} overflow='scroll'>
          <MacroStepper macroName='expose' />
        </Stack>
      </Stack>
    </Paper>
  );
}
