/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: ExposureNo.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Typography } from '@mui/material';
import React from 'react';
import { useKeywords } from 'renderer/hooks';

export default function ExposureNo() {
  const { filename_bundle: filenameBundle } = useKeywords('fliswarm', [
    'filename_bundle',
  ]);

  const [exposureNo, setExposureNo] = React.useState(0);

  React.useEffect(() => {
    if (!filenameBundle || filenameBundle.values.length === 0) return;

    const expNo = parseInt(
      filenameBundle.values[0].match(/([0-9]{4})\.fits/)[0],
      10
    );
    setExposureNo(expNo);
  }, [filenameBundle]);

  return (
    <Box visibility={exposureNo !== 0 ? 'initial' : 'hidden'}>
      <Typography component='span' variant='h6' fontFamily='monospace'>
        Exposure
      </Typography>
      <Typography
        component='span'
        variant='h6'
        color='text.secondary'
        fontFamily='monospace'
        pl={0.5}
      >
        #{exposureNo}
      </Typography>
    </Box>
  );
}
