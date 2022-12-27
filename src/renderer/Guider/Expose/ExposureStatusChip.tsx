/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-30
 *  @Filename: ExposureStatusChip.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Chip, Tooltip } from '@mui/material';
import React from 'react';
import { useKeywordContext } from 'renderer/hooks';

export enum GuiderStatus {
  IDLE = 1 << 0,
  EXPOSING = 1 << 1,
  PROCESSING = 1 << 2,
  CORRECTING = 1 << 3,
  STOPPING = 1 << 4,
  FAILED = 1 << 5,
  WAITING = 1 << 6,
}

type ValidColors =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

export default function ExposureStatusChip() {
  const { guider_status: guiderStatus } = useKeywordContext();

  const [status, setStatus] = React.useState('Idle');
  const [color, setColor] = React.useState<ValidColors>('default');

  React.useEffect(() => {
    if (!guiderStatus) return;

    const bits: number = parseInt(guiderStatus.values[0] as string, 10);

    if (bits & GuiderStatus.FAILED) {
      setStatus('Error');
      setColor('error');
    } else if (bits & GuiderStatus.STOPPING) {
      setStatus('Stopping');
      setColor('warning');
    } else if (bits & GuiderStatus.EXPOSING) {
      setStatus('Exposing');
      setColor('success');
    } else if (bits & GuiderStatus.CORRECTING) {
      setStatus('Correcting');
      setColor('success');
    } else if (bits & GuiderStatus.PROCESSING) {
      setStatus('Processing');
      setColor('success');
    } else if (bits & GuiderStatus.WAITING) {
      setStatus('Waiting');
      setColor('default');
    } else if (bits & GuiderStatus.IDLE) {
      setStatus('Idle');
      setColor('default');
    } else {
      setStatus('Unknown');
      setColor('error');
    }
  }, [guiderStatus]);

  return (
    <Tooltip title='Status of the guider'>
      <Chip label={status} color={color} sx={{ alignSelf: 'center' }} />
    </Tooltip>
  );
}
