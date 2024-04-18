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
  Select,
  InputLabel,
  MenuItem
} from '@mui/material';
import { dialog} from 'electron';
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
            value='custom'
            control={<Radio />}
            label='Custom'
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

function CustomSounds() {
  
  const assignKey = 'audio.sounds';
  const listKey = 'audio.user_sounds';

  const [audioSounds, setAudioSounds] = React.useState<object>(
    window.electron.store.get(assignKey)
  );

  const[userSoundList, setUserSoundList] = React.useState<object>(
    window.electron.store.get(listKey) || ['error.wav']
  );
  console.log('user_sounds: ', userSoundList)
  console.log('audio.sounds: ', window.electron.store.get(assignKey))
  console.log("audioSounds: ", audioSounds)

  const getFiles = React.useCallback(async () => {
      await window.electron.dialog.listFiles()
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    console.log(event.target.name);
    audioSounds[event.target.name] = event.target.value;
    console.log("audioSounds: ", audioSounds)
    setAudioSounds(audioSounds);
    window.electron.store.set(assignKey, audioSounds);
    getFiles();
  };

  const [testSound, setTestSound] = React.useState<string>(
    userSoundList[0] || 'error.wav'
  );

  console.log("test sound: ", testSound)

  const assignTestSound = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setTestSound(event.target.value);

  };

  const soundOptions = userSoundList.map((option) => {
      return <MenuItem key= {option + "_option"} value={option}>{option}</MenuItem>;
    });

  console.log('sound options: ', soundOptions)
  const soundSelect = Object.keys(audioSounds).map((sound) => 
    <FormControl fullWidth key={sound +"_form"}>
    <InputLabel key={sound +"_label"}>{sound}</InputLabel>
    <Select
      value={audioSounds[sound]}
      label={sound +"_select"}
      name = {sound}
      key={sound +"_select"}
      onChange={handleChange}
    >
    {soundOptions}
    </Select>
    <Box sx={{ my: 1 }} />
  </FormControl>  
  );

  const soundTest =
    <Stack> 
    <Select
      value={userSoundList[0]}
      label={'Test Sound'}
      name = {'sound_test'}
      key={'sound_test'}
      onChange={assignTestSound}
    >
    {soundOptions}
    </Select>
    <Button variant="contained" onClick={() => window.electron.tools.playSound(testSound)}>
    Test Sound
    </Button>
    </Stack>

  return (
    <Stack>
    {soundTest}
    <Divider sx={{ my: 4 }} />
    {soundSelect}
    </Stack>
    );
}


export default function SoundsPane() {
  const [audioMode, setAudioMode] = useStore<string>('audio.mode');
  return (
    <Pane title='Sounds'>
      <Stack direction='column'>
        <Grid container direction='row'>
          <Grid xs={9}>
            <Stack width='100%' direction='column'>
              <AudioMode />
              <Divider sx={{ my: 4 }} />
              {audioMode==="custom" ? <CustomSounds /> : <Box />}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Pane>
  );
}

