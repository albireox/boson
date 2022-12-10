/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-14
 *  @Filename: AdvancedPane.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Button, FormControl, Radio, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import Grid from '@mui/system/Unstable_Grid';
import { useStore } from 'renderer/hooks';
import Pane from '../Components/Pane';
import PreferencesFormControlLabel from '../Components/PreferencesFormControlLabel';
import PreferencesRadioGroup from '../Components/PreferencesRadioGroup';

function Configuration() {
  const clearConfig = () => {
    window.electron.dialog
      .showMessageBox({
        message: 'Confirm removal of user configuration?',
        type: 'question',
        buttons: ['Cancel', 'OK'],
      })
      .then(({ response }) => {
        if (response === 1) {
          window.electron.store.clear();
        }
        return true;
      })
      .catch(() => {});
  };

  return (
    <Stack direction='column' spacing={1}>
      <Box>
        <Typography variant='button' color='text.secondary' fontSize='13px'>
          User Configuration
        </Typography>

        <Grid container pt={1} minHeight={50} alignContent='center'>
          <Grid xs={6}>
            <Typography
              variant='body2'
              fontSize={14}
              sx={(theme) => ({
                minWidth: '150px',
                color: theme.palette.text.primary,
                userSelect: 'none',
                alignSelf: 'center',
              })}
              gutterBottom
            >
              Reset configuration
            </Typography>
          </Grid>
          <Grid xs={6} alignItems='flex-end' textAlign='right'>
            <Button
              variant='contained'
              color='error'
              onClick={clearConfig}
              disableElevation
            >
              Reset
            </Button>
          </Grid>
        </Grid>
        <Typography variant='body2' color='text.secondary' mt={-1}>
          Reverts to the default configuration. An app restart is required.
        </Typography>
      </Box>
    </Stack>
  );
}

function AutoUpdateMode() {
  const [updateChannel] = useStore('updateChannel');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    window.electron.store.set('updateChannel', event.target.value);
  };

  return (
    <Stack>
      <Typography variant='button' color='text.secondary' fontSize='13px'>
        AutoUpdate channel
      </Typography>
      <FormControl sx={{ paddingTop: 1 }}>
        <PreferencesRadioGroup value={updateChannel} onChange={handleChange}>
          <PreferencesFormControlLabel
            value='latest'
            control={<Radio />}
            label='Stable'
            // gutterColor={theme.palette.grey[200]}
          />
          <PreferencesFormControlLabel
            value='beta'
            control={<Radio />}
            label='Beta'
            // gutterColor={theme.palette.grey[600]}
          />
          <PreferencesFormControlLabel
            value='alpha'
            control={<Radio />}
            label='Alpha'
            // gutterColor={blue[500]}
          />
        </PreferencesRadioGroup>
      </FormControl>
    </Stack>
  );
}

export default function AdvancedPane() {
  return (
    <Pane title='Advanced'>
      <Stack direction='column'>
        <Grid container direction='row'>
          <Grid xs={9}>
            <Stack width='100%' direction='column' spacing={5}>
              <Configuration />
              <AutoUpdateMode />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Pane>
  );
}