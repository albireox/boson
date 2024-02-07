/*
 *  @Author: Ryan Lisowski (lisowsk1@uw.edu)
 *  @Date: 2023-07-15
 *  @Filename: SoundsPane.tsx
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
import BooleanOption from '../Components/BooleanOption';
import Pane from '../Components/Pane';
import PreferencesFormControlLabel from '../Components/PreferencesFormControlLabel';
import PreferencesRadioGroup from '../Components/PreferencesRadioGroup';
import Switch from '../Components/Switch';
import {
  TypographyDescription,
  TypographyTitle,
} from '../Components/TypographyTitle';


function AudioMode() {
  const key = 'audio.mode';
  const [audioMode, setAudioMode] = React.useState<string>(
    window.electron.store.get(key) || 'on'
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAudioMode(event.target.value);
    window.electron.store.set(key, event.target.value);
  };

  return (
    <Stack>
      <Typography variant='button' color='text.secondary' fontSize='13px'>
        Sounds
      </Typography>
      <FormControl sx={{ paddingTop: 1 }}>
        <PreferencesRadioGroup value={audioMode} onChange={handleChange}>
          <PreferencesFormControlLabel
            value='on'
            control={<Radio />}
            label='On'
          />
          <PreferencesFormControlLabel
            value='minimal'
            control={<Radio />}
            label='Minimal'
          />
          <PreferencesFormControlLabel
            value='off'
            control={<Radio />}
            label='Off'
          />
        </PreferencesRadioGroup>
      </FormControl>
      <Box px={1} pr={2}>
        <BooleanOption param='audio.muted' title='Mute all sounds' />
      </Box>
    </Stack>
  );
}


export default function SoundsPane() {
  return (
    <Pane title='Sounds'>
      <Stack direction='column'>
        <Grid container direction='row'>
          <Grid xs={9}>
            <Stack width='100%' direction='column'>
              <AudioMode />
              <Divider sx={{ my: 4 }} />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Pane>
  );
}


