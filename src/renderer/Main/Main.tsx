/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: main.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ConnectionStatus } from 'main/tron/types';
import * as React from 'react';
import { useConnectionStatus, useStore } from '../hooks';
import Drawer from './Drawer';
import MainTabs from './Tabs';

type ConnectStackbarProps = {
  open: boolean;
  isReconnecting: boolean;
  handleConnect: () => void;
  handleStopConnecting: () => void;
};

const ReconnectSnackbar = ({
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
      sx={{ margin: 1 }}
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

const AuthenticationFailedSnackbar = ({
  open,
  handleRetry,
}: {
  open: boolean;
  handleRetry: () => void;
}): JSX.Element => {
  // Show a snackbar when the authorisation failed.

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
    >
      <Alert severity='warning'>
        <span style={{ padding: '0px 24px 0px 0px' }}>
          Authentication failed
        </span>
        <Button color='secondary' size='small' onClick={handleRetry}>
          RETRY
        </Button>
      </Alert>
    </Snackbar>
  );
};

export default function Main() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);

  const [connectionStatus] = useConnectionStatus();

  const [authenticationFailed, setAuthenticationFailed] = React.useState(false);

  const [reconnect, setReconnect] = React.useState(true);

  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [password, setPassword] = React.useState<string | null>(null);

  const [program] = useStore<string>('connection.program');
  const [needsAuthentication] = useStore<boolean>(
    'connection.needsAuthentication'
  );

  const connect = React.useCallback((authorise = true) => {
    setIsConnecting(true);
    setAuthenticationFailed(false);
    window.electron.tron
      .connectAndAuthorise(authorise, true)
      .then(() => {
        return true;
      })
      .catch(() => {
        setIsConnected(false);
        return false;
      })
      .finally(() => {
        setIsConnecting(false);
      });
  }, []);

  React.useEffect(() => {
    if (connectionStatus & ConnectionStatus.Authorised) {
      setIsConnected(true);
      setAuthenticationFailed(false);
      setReconnect(true);
      setShowPasswordModal(false);
    } else if (connectionStatus & ConnectionStatus.NoPassword) {
      setIsConnected(true);
      setShowPasswordModal(true);
    } else if (connectionStatus & ConnectionStatus.Connected) {
      setIsConnected(true);
    } else if (connectionStatus & ConnectionStatus.AuthenticationFailed) {
      setIsConnected(true);
      setReconnect(false);
    }
  }, [connectionStatus]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout | number = 0;
    if (!isConnected && !isConnecting && reconnect) {
      timer = setTimeout(() => connect(needsAuthentication), 1000);
    }

    if (connectionStatus & ConnectionStatus.Disconnected) {
      setIsConnected(false);
      setIsConnecting(false);
    }
    if (connectionStatus & ConnectionStatus.AuthenticationFailed) {
      setAuthenticationFailed(true);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [
    connect,
    isConnected,
    isConnecting,
    reconnect,
    needsAuthentication,
    connectionStatus,
  ]);

  const handlePassword = () => {
    if (password !== null) {
      window.electron.keytar.set(program, password);
      setShowPasswordModal(false);
      connect(needsAuthentication);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', height: '100%' }}>
        <CssBaseline />
        <Drawer />
        <Box
          sx={{
            flexGrow: 1,
            height: '100%',
          }}
        >
          <MainTabs />
        </Box>
      </Box>
      <Dialog
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      >
        <DialogTitle>Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Provide the password for program {program}
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            id='password'
            label='Password'
            type='password'
            fullWidth
            variant='standard'
            onKeyDown={(event) => event.key === 'Enter' && handlePassword()}
            onChange={(event) => setPassword(event.target.value)}
          />
        </DialogContent>
        <DialogActions defaultValue='OK'>
          <Button onClick={() => setShowPasswordModal(false)}>Cancel</Button>
          <Button onClick={handlePassword}>OK</Button>
        </DialogActions>
      </Dialog>
      <ReconnectSnackbar
        open={!isConnected && !authenticationFailed}
        isReconnecting={reconnect}
        handleConnect={() => setReconnect(true)}
        handleStopConnecting={() => setReconnect(false)}
      />
      <AuthenticationFailedSnackbar
        open={!isConnecting && authenticationFailed}
        handleRetry={() => {
          setIsConnected(false);
          setReconnect(true);
        }}
      />
    </>
  );
}
