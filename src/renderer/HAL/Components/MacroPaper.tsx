/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-09
 *  @Filename: MacroPaper.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Paper } from '@mui/material';
import React from 'react';
import useIsMacroRunning from '../useIsMacroRunning';

export default function MacroPaper(props: React.PropsWithChildren) {
  const { children } = props;

  const autoIsRunning = useIsMacroRunning('auto');

  return (
    <Paper
      variant='outlined'
      sx={{
        pointerEvents: autoIsRunning ? 'none' : 'inherit',
        opacity: autoIsRunning ? 0.6 : 'inherit',
      }}
    >
      {children}
    </Paper>
  );
}
