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
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  LinearProgressProps,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import { round } from 'lodash';
import React from 'react';
import { CommandButton } from 'renderer/Components';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import { useKeywordContext, useStore } from 'renderer/hooks';
import useIsMacroRunning from 'renderer/hooks/useIsMacroRunning';
import { ExposureTimeInput } from './Components/ExposureTimeInput';
import MacroPaper from './Components/MacroPaper';
import { MacroStageSelect } from './Components/MacroStageSelect';
import MacroStepper from './Components/MacroStepper';
import PauseResumeButton from './Components/PauseResumeButton';
import SnackAlert, { SnackAlertRefType } from './Components/SnackAlert';
import macros from './macros.json';

interface LinearProgressWithLabelProps extends LinearProgressProps {
  running: boolean;
  total: number;
  etr?: number;
  header?: string;
  suffix?: string;
}

function LinearProgressWithLabel(props: LinearProgressWithLabelProps) {
  const { running, total, etr, header, suffix } = props;

  const [etrDisplay, setEtrDisplay] = React.useState(etr || total);
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | string | number | undefined;
    const { etr: propsETR } = props;
    if (propsETR) setEtrDisplay(propsETR);
    if (running) {
      interval = setInterval(
        () => setEtrDisplay((etrD) => (etrD - 1 <= 0 ? 0 : etrD - 1)),
        1000
      );
    }

    return () => clearInterval(interval);
  }, [running, props]);

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
    <Grid2 direction='row' alignItems='center' columns={12} container>
      <Grid2 xs={2} md={1}>
        <Typography variant='body2' color='text.secondary'>
          {header}
        </Typography>
      </Grid2>
      <Grid2 xs={8} md={10}>
        <LinearProgress
          variant={running ? 'determinate' : 'indeterminate'}
          value={value}
          sx={{ height: 5, borderRadius: 5 }}
          {...props}
        />
      </Grid2>
      <Grid2 xs={2} md={1}>
        <Typography variant='body2' color='text.secondary'>{`${round(
          etrDisplay || 0,
          0
        )}s ${suffix}`}</Typography>
      </Grid2>
    </Grid2>
  );
}

export default function Expose() {
  const macroName = 'expose';

  const isLarge = useMediaQuery('(min-width: 680px)');

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

  const halKeywords = useKeywordContext();

  const snackCountRef = React.useRef<SnackAlertRefType>(null);

  const { exposure_state_apogee: apogeeStateKw } = halKeywords;
  const { exposure_state_boss: bossStateKw } = halKeywords;
  const { stages: stagesKw } = halKeywords;
  const { running_macros: runningMacrosKw } = halKeywords;

  const { 'hal.expose_is_paused': pausedKw } = halKeywords;
  const isPaused = pausedKw?.values[0] ?? false;

  const getCommandString = React.useCallback(
    (modify = false, newCount: string | undefined = undefined) => {
      const commandString: string[] = ['hal expose'];

      if (modify) {
        commandString.push('--modify');
      }

      const joinedStages = stages.filter((v) => v != 'auto').join(',');

      if (joinedStages.length > 0) commandString.push(`-s ${joinedStages}`);

      if (pairs) {
        commandString.push('--pairs');
      } else {
        commandString.push('--no-pairs');
      }

      if (stages.length === 0 || stages.includes('expose_boss')) {
        commandString.push(
          `-b ${bossTime || macros.expose.defaults.boss_exptime}`
        );
      } else if (stages.includes('expose_apogee')) {
        commandString.push(
          `--reads ${apogeeReads || macros.expose.defaults.apogee_reads}`
        );
      }

      const computedCount = newCount || count || macros.expose.defaults.count;
      commandString.push(`--count ${computedCount}`);

      return commandString.join(' ');
    },
    [bossTime, apogeeReads, pairs, stages, count]
  );

  const modifyCount = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newCount = e.target.value;

      if (!isRunning) {
        setCount(newCount);
        return;
      }

      // Allow for a delay so that quick modification of the count
      // don't trigget multiple commands.
      setCount(newCount);

      const commandString = getCommandString(true, newCount);
      window.electron.tron
        .send(commandString)
        .then(() => {
          snackCountRef.current?.open();
          return true;
        })
        .catch(() => {
          snackCountRef.current?.open();
        });
    },
    [getCommandString, isRunning]
  );

  React.useEffect(() => {
    // Calculate approximate exposure times.

    let bossDetail = '';
    let apogeeDetail = '';

    const bossOverhead = observatory === 'APO' ? 80 : 40;
    const bossReadout = observatory === 'APO' ? 67 : 35;

    const type = pairs ? 'AB' : 'A';

    const nExp = parseInt(count || macros.expose.defaults.count.toString(), 10);

    if (stages.includes('auto')) {
      bossDetail = 'BOSS: ??? s (auto)';
      apogeeDetail = 'APOGEE: ??? s (auto)';
    } else {
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
          )} s (${nExp}x${type})`;
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

    if (actorStages.length === 0 || actorStages.includes('expose_boss')) {
      if (bossStateKw) {
        const bossState = bossStateKw.values;

        const bossCurrent = bossState[0];
        const bossNexp = bossState[1];
        const bossEtr = bossState[2];
        const bossTotal = bossState[3];

        setBossProgress(
          <LinearProgressWithLabel
            running={bossCurrent > 0 && isRunning && !isPaused}
            total={bossTotal}
            etr={bossEtr}
            header='BOSS'
            suffix={`(${bossCurrent}/${bossNexp})`}
          />
        );
        return;
      }
    }

    setBossProgress(<span />);
  }, [actorStages, bossStateKw, isRunning, isPaused]);

  React.useEffect(() => {
    // Create and update the APOGEE progress bar.

    if (actorStages.length === 0 || actorStages.includes('expose_apogee')) {
      if (apogeeStateKw) {
        const apogeeState = apogeeStateKw.values;

        const apogeeCurrent = apogeeState[0];
        const apogeeNexp = apogeeState[1];
        const apogeeEtr = apogeeState[4];
        const apogeeTotal = apogeeState[5];

        setApogeeProgress(
          <LinearProgressWithLabel
            running={apogeeCurrent > 0 && isRunning && !isPaused}
            total={apogeeTotal}
            etr={apogeeEtr}
            header='APOGEE'
            color='secondary'
            suffix={`(${apogeeCurrent}/${apogeeNexp})`}
          />
        );
        return;
      }
    }

    setApogeeProgress(<span />);
  }, [actorStages, apogeeStateKw, isRunning, isPaused]);

  return (
    <>
      <MacroPaper backcolor='#448AFF30'>
        <Stack
          direction='column'
          divider={<Divider variant='middle' sx={{ opacity: 0.8 }} />}
          p={1}
          px={2}
          spacing={1}
        >
          <Stack alignItems='center' direction='row' spacing={2}>
            <Typography variant='h6' whiteSpace='nowrap'>
              Expose
            </Typography>
            <MacroStageSelect
              macro={macroName}
              autoMode={true}
              minWidth={100}
              maxWidth={145}
              onStagesSelected={React.useCallback(
                (stgs: string[]) => setStages(stgs),
                []
              )}
            />
            <Stack
              alignItems='center'
              direction='row'
              spacing={2}
              flexWrap='wrap'
              justifyContent='center'
            >
              {(stages.length === 0 ||
                stages.includes('all') ||
                stages.includes('expose_boss')) && (
                <ExposureTimeInput
                  label='BOSS Exp'
                  value={bossTime}
                  onChange={(e) => {
                    e.preventDefault();
                    setBossTime(e.target.value);
                  }}
                  disabled={isRunning}
                  width='55px'
                  isNumber={false}
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
                      width: '40px',
                      '& .MuiInputBase-root': {
                        marginTop: 1,
                        '& .MuiInput-input': {
                          paddingTop: 0.5,
                          paddingBottom: 0.2,
                        },
                      },
                    }}
                    disabled={isRunning}
                  />
                )}
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
                  width: '40px',
                  '& .MuiInputBase-root': {
                    marginTop: 1,
                    '& .MuiInput-input': {
                      paddingTop: 0.5,
                      paddingBottom: 0.2,
                    },
                  },
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
                sx={{ display: isLarge ? 'inherit' : 'none' }}
                disabled={isRunning}
              />
            </Stack>
            <Box flexGrow={1} />
            <Collapse orientation='horizontal' in={isRunning}>
              <PauseResumeButton macro='expose' />
            </Collapse>
            <CommandWrapper commandString='hal abort-exposures'>
              <CommandButton
                variant='outlined'
                color='error'
                sx={{ pointerEvents: 'all' }}
              >
                Stop exposures
              </CommandButton>
            </CommandWrapper>
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
              <Stack direction='column' spacing={2} width='100%'>
                {bossProgress} {apogeeProgress}
              </Stack>
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
      </MacroPaper>
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
