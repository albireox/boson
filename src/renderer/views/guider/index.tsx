/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-14
 *  @Filename: guider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import { Stack } from '@mui/material';
import { Box } from '@mui/system';
import * as React from 'react';
import { GuideStack } from './guide';
import { GuideTable } from './guideTable';
import { JS9Frame } from './js9';

export interface IJS9Opts {
  colormap: string;
  scale: string;
}

export const JS9Opts = {
  colormap: window.api.store.get_sync('user.guider.colormap') || 'grey',
  scale: window.api.store.get_sync('user.guider.scale') || 'log'
};

export default function GuiderView() {
  return (
    <>
      <Stack
        alignContent='center'
        direction='column'
        height='100%'
        sx={{
          p: [1, 2, 2, 2]
        }}
      >
        <Box sx={{ mb: 1 }}>
          <JS9Frame />
        </Box>
        <GuideStack />
        <GuideTable />
      </Stack>
    </>
  );
}
