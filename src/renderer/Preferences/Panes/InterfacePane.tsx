/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-14
 *  @Filename: Interface.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
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

  const deleteSavedWindows = () => {
    window.electron.store.delete('savedState.windows');
  };

  return (
    <Stack direction='column'>
      <Typography variant='button' color='text.secondary'>
        Theme mode
      </Typography>
      <FormControl sx={{ paddingTop: 0.5 }}>
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
      <Divider sx={{ my: 3 }} />
      <Typography variant='button' color='text.secondary'>
        Window management
      </Typography>
      <Grid container pt={1} minHeight={50} alignContent='center'>
        <Grid xs={6}>
          <Typography
            variant='body2'
            fontSize={14}
            sx={{
              minWidth: '150px',
              color: theme.palette.text.primary,
              userSelect: 'none',
              alignSelf: 'center',
            }}
            gutterBottom
          >
            Save window positions
          </Typography>
        </Grid>
        <Grid xs={6} alignItems='flex-end' textAlign='right'>
          <Switch param='interface.saveWindows' />
        </Grid>
      </Grid>
      <Typography variant='body2' color='text.secondary' mt={-1}>
        Remembers open windows, dimensions, and positions.
      </Typography>
      <Stack direction='row-reverse' pt={1.5}>
        <Button variant='contained' onClick={deleteSavedWindows}>
          Delete saved windows
        </Button>
      </Stack>
    </Stack>
  );
}

export default function InterfacePane() {
  return (
    <Pane title='Interface'>
      <Stack direction='column'>
        <Grid container direction='row'>
          <Grid xs={9}>
            <Stack>
              <ThemeMode />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Pane>
  );
}
