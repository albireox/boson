/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-14
 *  @Filename: guider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import { Stack } from '@mui/material';
import * as React from 'react';
import { GuideStack } from './guide';
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
    <Stack alignContent='top' direction='column' padding={2} spacing={1}>
      <JS9Frame />
      <GuideStack />
    </Stack>
  );
}
