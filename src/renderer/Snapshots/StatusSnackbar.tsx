/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: StatusSnackbar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Alert, AlertColor, keyframes, Snackbar } from '@mui/material';
import { ConnectionStatus, Keyword } from 'main/tron/types';
import React from 'react';
import { useConnectionStatus } from 'renderer/hooks';

interface StatusSnackBarProps {
  fpsStatusKw: Keyword;
  isFoldedKw: Keyword;
  isLockedKw: Keyword;
}

export default function StatusSnackBar(props: StatusSnackBarProps) {
  const { fpsStatusKw, isFoldedKw, isLockedKw } = props;

  const [label, setLabel] = React.useState('The FPS is idle');
  const [isMoving, setIsMoving] = React.useState(false);
  const [isFolded, setIsFolded] = React.useState(true);
  const [isLocked, setIsLocked] = React.useState(false);
  const [severity, setSeverity] = React.useState<AlertColor>('success');

  const [connectionStatus] = useConnectionStatus();

  React.useEffect(() => {
    if (fpsStatusKw) {
      const value = fpsStatusKw.values[0];

      if ((value & 2) > 0) {
        setIsMoving(true);
      } else {
        setIsMoving(false);
      }
    }

    if (isFoldedKw) {
      setIsFolded(isFoldedKw.values[0]);
    }

    if (isLockedKw) {
      setIsLocked(isLockedKw.values[0]);
    }
  }, [fpsStatusKw, isFoldedKw, isLockedKw]);

  React.useEffect(() => {
    if (isLocked) {
      setSeverity('error');
      setLabel('FPS is locked');
    } else if (isMoving) {
      setSeverity('warning');
      setLabel('FPS is moving');
    } else if (isFolded) {
      setSeverity('success');
      setLabel('FPS is folded');
    } else {
      setSeverity('info');
      setLabel('FPS is configured');
    }
  }, [isMoving, isFolded, isLocked]);

  const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }`;

  if (!(connectionStatus & ConnectionStatus.Ready)) return null;

  return (
    <Snackbar open anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
      <Alert
        severity={severity}
        sx={{
          width: '100%',
          '&.MuiPaper-root': isMoving
            ? {
                backgroundPosition: 'left center',
                backgroundSize: '200% 200% !important',
                background: 'linear-gradient(90deg, #662f24, #246625)',
                animation: `${gradient} 3s infinite ease`,
              }
            : {},
        }}
      >
        {label}
      </Alert>
    </Snackbar>
  );
}
