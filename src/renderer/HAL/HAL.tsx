/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  CssBaseline,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { Keyword } from 'main/tron/types';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import ApogeeDomeFlat from './ApogeeDomeFlat';
import Expose from './Expose';
import GotoField from './GotoField';
import HALHeader from './Header';
import hal9000logo from './images/hal9000.png';
import Scripts from './Scripts';

export const HALContext = React.createContext<{ [key: string]: Keyword }>({});

export type ExposureTimeInputType = {
  label: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ExposureTimeInput = ({
  label,
  value,
  onChange,
}: ExposureTimeInputType) => (
  <TextField
    label={label}
    size='small'
    type='number'
    InputProps={{
      endAdornment: <InputAdornment position='end'>s</InputAdornment>,
    }}
    variant='standard'
    value={value}
    onChange={onChange}
    InputLabelProps={{
      shrink: true,
    }}
    sx={{
      width: '80px',
      '& .MuiInputBase-root': { marginTop: 1 },
    }}
  />
);

export default function HALView() {
  const halKeywords = useKeywords('hal', [
    'running_macros',
    'stage_status',
    'stages',
    'available_scripts',
    'exposure_state_apogee',
    'exposure_state_boss',
  ]);

  React.useEffect(() => {
    window.electron.tron.send('hal status --full');
  }, []);

  return (
    <HALContext.Provider value={halKeywords}>
      <Box
        id='background-image'
        sx={{
          position: 'relative',
          height: '100%',
          '&:before': {
            position: 'absolute',
            content: '" "',
            width: '100%',
            height: '100%',
            backgroundImage: `url(${hal9000logo})`,
            backgroundSize: 'cover',
            zIndex: -1,
            opacity: 0.1,
          },
        }}
      >
        <CssBaseline />
        <HALHeader />
        <Stack
          direction='column'
          spacing={1}
          pt={1}
          px={2}
          zIndex={10}
          position='relative'
        >
          <GotoField />
          <Expose />
          <ApogeeDomeFlat />
          <Scripts />
        </Stack>
      </Box>
    </HALContext.Provider>
  );
}
