/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, InputAdornment, Stack, TextField } from '@mui/material';
import { KeywordMap } from 'main/tron';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import ApogeeDomeFlatView from './apogee-dome-flat';
import ExposeView from './expose';
import GotoFieldView from './goto_field';
import HALHeader from './header';
import hal9000logo from './images/hal9000.png';
import HALScripts from './scripts';

/** @jsxImportSource @emotion/react */

export const HALContext = React.createContext<KeywordMap>({});

export type ExposureTimeInputType = {
  label: string;
  value: any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ExposureTimeInput = ({ label, value, onChange }: ExposureTimeInputType) => (
  <TextField
    label={label}
    size='small'
    InputProps={{ endAdornment: <InputAdornment position='end'>s</InputAdornment> }}
    variant='standard'
    value={value || ' '}
    onChange={onChange}
    sx={{
      width: '80px',
      '& .MuiInputBase-root': { marginTop: 1 }
    }}
  />
);

export default function HALView() {
  const halKeywords = useKeywords(
    ['hal.stage_status', 'hal.stages', 'hal.available_scripts'],
    'hal-keys'
  );

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
            opacity: 0.1
          }
        }}
      >
        <Stack direction='column' spacing={1} px={2} zIndex={10} position='relative'>
          <HALHeader />
          <GotoFieldView />
          <ExposeView />
          <ApogeeDomeFlatView />
          <HALScripts keywords={halKeywords} />
        </Stack>
      </Box>
    </HALContext.Provider>
  );
}
