/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-14
 *  @Filename: Interface.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  Button,
  Divider,
  FormControl,
  Radio,
  Typography,
  useTheme,
} from '@mui/material';
import { blue } from '@mui/material/colors';
import { Stack } from '@mui/system';
import Grid from '@mui/system/Unstable_Grid';
import React from 'react';
import { ColorModeValues } from 'renderer/App';
import { useStore } from 'renderer/hooks';
import Pane from '../Components/Pane';
import PreferencesFormControlLabel from '../Components/PreferencesFormControlLabel';
import PreferencesRadioGroup from '../Components/PreferencesRadioGroup';
import Switch from '../Components/Switch';

function ThemeMode() {
  const theme = useTheme();
  const [themeMode, setThemeMode] = React.useState<ColorModeValues>('system');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeMode(event.target.value as ColorModeValues);
    window.electron.store.set('interface.mode', event.target.value);
  };

  return (
    <Stack>
      <Typography variant='button' color='text.secondary' fontSize='13px'>
        Theme mode
      </Typography>
      <FormControl sx={{ paddingTop: 1 }}>
        <PreferencesRadioGroup value={themeMode} onChange={handleChange}>
          <PreferencesFormControlLabel
            value='light'
            control={<Radio />}
            label='Light'
            gutterColor={theme.palette.grey[200]}
          />
          <PreferencesFormControlLabel
            value='dark'
            control={<Radio />}
            label='Dark'
            gutterColor={theme.palette.grey[600]}
          />
          <PreferencesFormControlLabel
            value='system'
            control={<Radio />}
            label='System'
            gutterColor={blue[500]}
          />
        </PreferencesRadioGroup>
      </FormControl>
    </Stack>
  );
}

function WindowManagement() {
  const [saveOnlyOnRequest] = useStore<boolean>('interface.saveOnlyOnRequest');

  const deleteSavedWindows = () => window.electron.store.delete('windows');

  return (
    <Stack direction='column' spacing={1}>
      <Box>
        <Typography variant='button' color='text.secondary' fontSize='13px'>
          Window management
        </Typography>

        {/* Save window positions */}
        <Grid container pt={1} minHeight={50} alignContent='center'>
          <Grid xs={9}>
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
              Save window positions
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              alignSelf='center'
            >
              Remembers open windows, dimensions, and positions.
            </Typography>
          </Grid>
          <Grid xs={3} alignItems='flex-end' textAlign='right'>
            <Switch
              disabled={saveOnlyOnRequest}
              param='interface.saveWindows'
            />
          </Grid>
        </Grid>
      </Box>

      {/* Save only when requested */}
      <Box>
        <Grid container pt={1} minHeight={50} alignContent='center'>
          <Grid xs={9}>
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
              Save only when requested
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Windows will be saved only when manually requested
            </Typography>
          </Grid>
          <Grid
            xs={3}
            alignItems='flex-end'
            textAlign='right'
            alignSelf='center'
          >
            <Switch param='interface.saveOnlyOnRequest' />
          </Grid>
        </Grid>
      </Box>

      {/* Delete window positions */}
      <Box>
        <Grid container pt={1} minHeight={50} alignContent='center'>
          <Grid xs={9}>
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
              Delete window positions
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              alignSelf='center'
            >
              Removes all saved window position.
            </Typography>
          </Grid>
          <Grid xs={3} alignItems='flex-end' textAlign='right'>
            <Button
              variant='contained'
              color='error'
              onClick={deleteSavedWindows}
              disableElevation
            >
              Delete
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}

export default function InterfacePane() {
  return (
    <Pane title='Interface'>
      <Stack direction='column'>
        <Grid container direction='row'>
          <Grid xs={9}>
            <Stack width='100%' direction='column'>
              <ThemeMode />
              <Divider sx={{ my: 4 }} />
              <WindowManagement />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Pane>
  );
}
