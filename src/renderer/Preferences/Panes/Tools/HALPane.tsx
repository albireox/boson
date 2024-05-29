/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: LogWindowPane.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Grid, Stack } from '@mui/material';
import BooleanOption from 'renderer/Preferences/Components/BooleanOption';
import Pane from 'renderer/Preferences/Components/Pane';

function GotoAutoMode() {
  return (
    <BooleanOption
      param='hal.allowGotoFieldAutoMode'
      title='Allow goto-field auto mode'
      description='Enable the auto mode for the goto-field macro'
    />
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

function UseColours() {
  return (
    <BooleanOption
      param='hal.useColours'
      title='Use colours'
      description='Use different colours for the background of the HAL macros'
    />
  );
}

export default function LogWindowPane() {
  return (
    <Pane title='HAL'>
      <Grid container direction='row'>
        <Grid item xs={9}>
          <Stack width='100%' direction='column' spacing={2.5}>
            <GotoAutoMode />
            <SyncStages />
            <UseColours />
          </Stack>
        </Grid>
      </Grid>
    </Pane>
  );
}
