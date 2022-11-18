/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-14
 *  @Filename: Pane.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import * as React from 'react';

export type PaneProps = {
  title: string;
  children: React.ReactNode;
};

export default function Pane({ title, children }: PaneProps) {
  return (
    <Box overflow='hidden'>
      <Typography variant='h5' pb={3}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
