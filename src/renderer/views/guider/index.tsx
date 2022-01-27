/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-14
 *  @Filename: guider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import { Box, Stack } from '@mui/material';
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
    <Box
      overflow='scroll'
      width='100%'
      css={{
        '::-webkit-scrollbar': {
          display: 'none'
        }
      }}
    >
      <Stack alignContent='top' direction='column' px={2} py={0} spacing={1}>
        <JS9Frame />
        <GuideStack />
        <GuideTable />
      </Stack>
    </Box>
  );
}
