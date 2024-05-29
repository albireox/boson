/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-09
 *  @Filename: MacroPaper.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Paper } from '@mui/material';
import React from 'react';
import { useAutoPilotMacroName } from 'renderer/HAL/AutoPilot';
import { useIsMacroRunning, useStore } from 'renderer/hooks';

interface MacroPaperProps {
  backcolor?: string;
  children: React.ReactNode;
}

export default function MacroPaper(props: MacroPaperProps) {
  const { backcolor, children } = props;

  const autoPilotMacroName = useAutoPilotMacroName();
  const autoIsRunning = useIsMacroRunning(autoPilotMacroName);

  const [useBackcolor] = useStore<boolean>('hal.useColours');

  return (
    <Paper
      variant='outlined'
      sx={{
        pointerEvents: autoIsRunning ? 'none' : 'inherit',
        opacity: autoIsRunning ? 0.6 : 'inherit',
        backgroundColor:
          useBackcolor && backcolor ? backcolor : 'background.paper',
      }}
    >
      {children}
    </Paper>
  );
}
