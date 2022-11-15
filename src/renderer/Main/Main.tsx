/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: main.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MenuIcon from '@mui/icons-material/Menu';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import * as React from 'react';
import { ConnectionStatus } from '../../main/tron/types';
import DrawerListItem from '../Components/DrawerListItem';
import PersistentDrawer from '../Components/PersistentDrawer';
import MainStatus from './MainStatus';

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
  const [open, setOpen] = React.useState(false);

  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);

  const [authenticationFailed, setAuthenticationFailed] = React.useState(false);

  const [reconnect, setReconnect] = React.useState(true);

  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [password, setPassword] = React.useState<string | null>(null);

  const [program] = React.useState<string>(
    window.electron.store.get('connection.program')
  );
  const [needsAuthentication] = React.useState<boolean>(
    window.electron.store.get('connection.needsAuthentication')
  );

  const connect = React.useCallback((authorise = true) => {
    setIsConnecting(true);
    setShowPasswordModal(false);
    setAuthenticationFailed(false);
    window.electron.tron
      .connectAndAuthorise(authorise)
      .then((status) => {
        if (status & ConnectionStatus.Authorised) {
          setIsConnected(true);
          setAuthenticationFailed(false);
          setReconnect(true);
        } else if (status & ConnectionStatus.NoPassword) {
          setIsConnected(true);
          setShowPasswordModal(true);
        } else if (status & ConnectionStatus.Connected) {
          setIsConnected(true);
        } else if (status & ConnectionStatus.AuthenticationFailed) {
          setIsConnected(true);
        }
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
    let timer: NodeJS.Timeout | number = 0;
    if (!isConnected && !isConnecting && reconnect) {
      timer = setTimeout(() => connect(needsAuthentication), 1000);
    }

    const handleStatus = (status: ConnectionStatus) => {
      if (status & ConnectionStatus.Disconnected) {
        setIsConnected(false);
        setIsConnecting(false);
      }
      if (status & ConnectionStatus.AuthenticationFailed) {
        setAuthenticationFailed(true);
      }
    };

    window.electron.ipcRenderer.on('tron:connection-status', handleStatus);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'tron:connection-status',
        handleStatus
      );
      clearInterval(timer);
    };
  }, [connect, isConnected, isConnecting, reconnect, needsAuthentication]);

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
        <PersistentDrawer open={open}>
          <>
            <DrawerListItem
              icon={<NotesIcon />}
              text='New log window'
              open={open}
            />
            <div style={{ flexGrow: 1 }} />
            <List>
              <DrawerListItem
                icon={<SettingsIcon />}
                text='Settings'
                open={open}
              />

              <ListItem
                disablePadding
                sx={{ display: 'block' }}
                onClick={() => setOpen(!open)}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    '&.MuiButtonBase-root:hover': {
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                    }}
                  >
                    {!open ? <MenuIcon /> : <KeyboardArrowLeftIcon />}
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            </List>
          </>
        </PersistentDrawer>
        <Box component='main' sx={{ flexGrow: 1, p: 3, height: '100%' }}>
          <MainStatus />
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
        handleConnect={() => {
          setReconnect(true);
        }}
        handleStopConnecting={() => setReconnect(false)}
      />
      <AuthenticationFailedSnackbar
        open={!isConnecting && authenticationFailed}
        handleRetry={connect}
      />
    </>
  );
}
