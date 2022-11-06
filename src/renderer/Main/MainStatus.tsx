/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: MainStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Alert,
  Button,
  Card,
  CardContent,
  Snackbar,
  Typography,
  useTheme,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useElapsedTime } from 'use-elapsed-time';
import icon from '../../../assets/icon.png';
import { ConnectionStatus } from '../../main/types';

type StatusTextProps = { color?: string | undefined } & React.PropsWithChildren;

const StatusText = ({ color = undefined, children }: StatusTextProps) => {
  return (
    <Typography
      variant='h6'
      fontFamily='monospace'
      component='span'
      fontSize={16}
      color={color}
    >
      {children}
    </Typography>
  );
};

type ConnectStackbarProps = {
  open: boolean;
  isReconnecting: boolean;
  handleConnect: () => void;
  handleStopConnecting: () => void;
};

const ConnectSnackbar = ({
  open,
  isReconnecting,
  handleConnect,
  handleStopConnecting,
}: ConnectStackbarProps): JSX.Element => {
  // Show a reconnect snackbar

  const handleAction = () =>
    isReconnecting ? handleStopConnecting() : handleConnect();

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
    >
      <Alert severity='warning'>
        <span style={{ padding: '0px 24px 0px 0px' }}>
          {`boson is ${!isReconnecting ? 'disconnected' : 'reconnecting'}`}
        </span>
        <Button color='secondary' size='small' onClick={() => handleAction()}>
          {!isReconnecting ? 'RECONNECT' : 'CANCEL'}
        </Button>
      </Alert>
    </Snackbar>
  );
};

const MainStatus = () => {
  const theme = useTheme();
  const { mode } = theme.palette;

  const [version, setVersion] = useState<string | undefined>(undefined);
  const [isPackaged, setIsPackaged] = useState<boolean | undefined>(undefined);

  const [connectionText, setConnectionText] = useState<React.ReactElement>(
    <StatusText color={theme.palette.text.disabled}>Unknown</StatusText>
  );

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const { elapsedTime, reset: resetElapsed } = useElapsedTime({
    isPlaying: isConnected,
    updateInterval: 1,
  });

  const formatElapsedTime = () => {
    const date = new Date(0);
    date.setSeconds(elapsedTime);
    return date.toISOString().substring(11, 19);
  };

  const program: string = window.electron.store.get('connection.program');

  useEffect(() => {
    window.electron.app
      .getVersion()
      .then((result) => setVersion(result))
      .catch(() => {});

    window.electron.app
      .isPackaged()
      .then((result) => setIsPackaged(result))
      .catch(() => {});

    const handleConnectionStatus = (status: number) => {
      if (ConnectionStatus.Connected & status) {
        setConnectionText(
          <StatusText color={theme.palette.success[mode]}>Connected</StatusText>
        );
        setIsConnected(true);
        window.electron.tron
          .getLastConnected()
          .then((value: Date) => {
            return resetElapsed((Date.now() - value.getTime()) / 1000);
          })
          .catch(() => {});
      } else if (
        ConnectionStatus.Reconnecting & status ||
        ConnectionStatus.Connecting & status
      ) {
        setIsConnected(false);
        if (ConnectionStatus.Reconnecting & status) setIsReconnecting(true);
        resetElapsed();
        setConnectionText(
          <StatusText color={theme.palette.warning[mode]}>
            {ConnectionStatus.Connecting & status
              ? 'Connecting'
              : 'Reconnecting'}
          </StatusText>
        );
      } else if (ConnectionStatus.Disconnected & status) {
        setIsConnected(false);
        setIsReconnecting(false);
        resetElapsed();
        setConnectionText(
          <StatusText color={theme.palette.error[mode]}>
            Disconnected
          </StatusText>
        );
      }
    };

    // First time, just in case tron doesn't emit the status on time.
    window.electron.tron
      .getStatus()
      .then(handleConnectionStatus)
      .catch(() => {});

    // From now on just listen to the event.
    window.electron.ipcRenderer.on(
      'tron:connection-status',
      handleConnectionStatus
    );

    return function cleanup() {};
  }, [mode, theme, resetElapsed]);

  const handleConnect = () => window.electron.tron.connect();
  const handleStopConnecting = () => window.electron.tron.disconnect();

  return (
    <>
      <Stack
        direction='column'
        spacing={1}
        width='100%'
        alignItems='center'
        height='100%'
      >
        <img width='150' alt='icon' src={icon} />
        <Typography variant='h3'>
          boson {isPackaged !== undefined && isPackaged ? version : 'dev'}
        </Typography>
        <Box width='100%' paddingTop={2}>
          <Card variant='outlined'>
            <CardContent>
              <StatusText>Status: </StatusText>
              {connectionText}
              <br />
              <StatusText>Elapsed: {formatElapsedTime()}</StatusText>
              <br />
              <StatusText>Program: {program.toUpperCase()}</StatusText>
            </CardContent>
          </Card>
        </Box>
      </Stack>
      <ConnectSnackbar
        open={!isConnected}
        isReconnecting={isReconnecting}
        handleConnect={handleConnect}
        handleStopConnecting={handleStopConnecting}
      />
    </>
  );
};

export default MainStatus;
