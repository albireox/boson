/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: LogWindowPane.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Grid, Stack } from '@mui/material';
import BooleanOption from 'renderer/Preferences/Components/BooleanOption';
import Pane from 'renderer/Preferences/Components/Pane';
import Switch from 'renderer/Preferences/Components/Switch';
import {
  TypographyDescription,
  TypographyTitle,
} from 'renderer/Preferences/Components/TypographyTitle';

function AutoMode() {
  return (
    <Grid container pt={1} minHeight={50} alignContent='center'>
      <Grid item xs={9}>
        <TypographyTitle>Allow goto-field auto mode</TypographyTitle>
        <TypographyDescription>
          Enable the auto mode for the goto-field macro
        </TypographyDescription>
      </Grid>
      <Grid
        item
        xs={3}
        alignItems='flex-end'
        textAlign='right'
        alignSelf='center'
      >
        <Switch param='hal.useAutoMode' />
      </Grid>
    </Grid>
  );
}

function SyncStages() {
  return (
    <BooleanOption
      param='hal.syncStages'
      title='Sync selected stages'
      description='Update the stages menu with the last stages
                   with which the macro run'
    />
  );
}

export default function LogWindowPane() {
  return (
    <Pane title='HAL'>
      <Grid container direction='row'>
        <Grid item xs={9}>
          <Stack width='100%' direction='column' spacing={2.5}>
            <AutoMode />
            <SyncStages />
          </Stack>
        </Grid>
      </Grid>
    </Pane>
  );
}
