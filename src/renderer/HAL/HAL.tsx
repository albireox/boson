/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline, Stack } from '@mui/material';
import React from 'react';
import { KeywordContext, useKeywords } from 'renderer/hooks';
import ApogeeDomeFlat from './ApogeeDomeFlat';
import AutoMacro from './Auto';
import Expose from './Expose';
import GotoField from './GotoField';
import HALHeader from './Header/Header';
import hal9000logo from './images/hal9000.png';
import Scripts from './Scripts';

export default function HAL() {
  const halKeywords = useKeywords([
    'hal.running_macros',
    'hal.stage_status',
    'hal.stages',
    'hal.available_scripts',
    'hal.exposure_state_apogee',
    'hal.exposure_state_boss',
    'jaeger.configuration_loaded',
    'jaeger.design_preloaded',
    'jaeger.preloaded_is_cloned',
  ]);

  React.useEffect(() => {
    window.electron.tron.send('hal status --full');
  }, []);

  return (
    <KeywordContext.Provider value={halKeywords}>
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
          <AutoMacro />
          <GotoField />
          <Expose />
          <ApogeeDomeFlat />
          <Scripts />
        </Stack>
      </Box>
    </KeywordContext.Provider>
  );
}
