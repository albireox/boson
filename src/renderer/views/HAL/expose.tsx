/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-01-16
 *  @Filename: expose.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Checkbox, Divider, FormControlLabel, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { CommandButton } from 'renderer/components/commandButton';
import { MacroStageSelect } from 'renderer/components/macroStageSelect';
import { ExposureTimeInput } from '.';
import macros from './macros.json';
import MacroStepper from './macro_stepper';

/** @jsxImportSource @emotion/react */

export default function ExposeView(): JSX.Element | null {
  const [apogeeTime, setApogeeTime] = React.useState<any>(macros.expose.defaults.apogee_exptime);
  const [bossTime, setBossTime] = React.useState<any>(macros.expose.defaults.boss_exptime);
  const [pairs, setPairs] = React.useState<boolean>(macros.expose.defaults.pairs);

  const [stages, setStages] = React.useState<string[]>([]);

  const getCommandString = () => {
    let commandString: string[] = ['hal expose'];

    const apogeeTimeTrim = apogeeTime.toString().trim();
    const bossTimeTrim = bossTime.toString().trim();

    if (stages.length > 0) commandString.push('-s ' + stages.join(','));
    if (pairs) {
      commandString.push('--pairs');
    } else {
      commandString.push('--no-pairs');
    }
    if (apogeeTimeTrim) commandString.push(`-a ${apogeeTimeTrim}`);
    if (bossTimeTrim) commandString.push(`-b ${bossTimeTrim}`);

    return commandString.join(' ');
  };

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
            stages={macros.goto_field.stages}
            maxWidth={200}
            minWidth={100}
            onStagesSelected={(stgs) => setStages(stgs)}
          />
          <Stack direction='column' spacing={1}>
            <Stack direction='row' spacing={1}>
              <ExposureTimeInput
                label='BOSS Exp Time'
                value={bossTime}
                onChange={(e) => {
                  e.preventDefault();
                  setBossTime(e.target.value);
                }}
              />
              <ExposureTimeInput
                label='AP Exp Time'
                value={apogeeTime}
                onChange={(e) => setApogeeTime(e.target.value)}
              />
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pairs}
                  disableRipple
                  onChange={(e) => setPairs(e.target.checked)}
                  size='small'
                  sx={{ pl: 0 }}
                />
              }
              label='Pairs'
            />
          </Stack>
          <Box flexGrow={1} />
          <CommandButton
            commandString={getCommandString()}
            abortCommand='hal goto-field --stop'
            size='medium'
          >
            Run
          </CommandButton>
        </Stack>
        <Stack alignItems='center' direction='row' spacing={2} overflow='scroll'>
          <MacroStepper macroName='expose' />
        </Stack>
      </Stack>
    </Paper>
  );
}
