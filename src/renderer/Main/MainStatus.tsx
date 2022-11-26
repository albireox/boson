/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: MainStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Card, CardContent, Typography, useTheme } from '@mui/material';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';
import { ConnectionStatus } from 'main/tron/types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useStore } from 'renderer/hooks';
import { useElapsedTime } from 'use-elapsed-time';
import icon from '../../../assets/icon.png';

type StatusTextProps = { color?: string | undefined } & React.PropsWithChildren;

const StatusText = ({ color = undefined, children }: StatusTextProps) => {
  return (
    <Typography
      variant='h6'
      fontFamily='monospace'
      component='span'
      fontSize={16}
      color={color}
      sx={{ WebkitUserSelect: 'unset' }}
    >
      {children}
    </Typography>
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

  const [isPlaying, setIsPlaying] = useState(false);
  const { elapsedTime, reset: resetElapsed } = useElapsedTime({
    isPlaying,
    updateInterval: 1,
  });

  const formatElapsedTime = React.useCallback((elap_: number) => {
    let elap = elap_;

    const nDays = Math.trunc(elap / (24 * 3600));
    if (nDays > 0) elap -= nDays * 24 * 3600;

    const date = new Date(0);
    date.setSeconds(elap);

    let prefix = '';
    if (nDays === 1) {
      prefix = '1 day ';
    } else if (nDays > 1) {
      prefix = `${nDays} days `;
    }

    return prefix + date.toISOString().substring(11, 19);
  }, []);

  const [program, setProgram] = useState('N/A');
  const [host, setHost] = useState('N/A');
  const [port, setPort] = useState('N/A');
  const [user, setUser] = useState('N/A');

  const [needsAuthentication] = useStore<number>(
    'connection.needsAuthentication'
  );

  const hostPort = host !== 'N/A' ? `${host}:${port}` : 'N/A';

  useEffect(() => {
    const startTimer = () => {
      window.electron.tron
        .getLastConnected()
        .then((value: Date) => {
          return resetElapsed((Date.now() - value.getTime()) / 1000);
        })
        .catch(() => {});
      setIsPlaying(true);
    };

    const setCredentials = () => {
      window.electron.tron
        .getCredentials()
        .then((credentials) => {
          setUser(credentials[1]);
          setProgram(credentials[2]);
          setHost(credentials[3]);
          setPort(credentials[4].toString());
          return true;
        })
        .catch(() => {});
    };

    const resetCredentials = () => {
      setUser('N/A');
      setProgram('N/A');
      setHost('N/A');
      setPort('N/A');
    };

    window.electron.app
      .getVersion()
      .then((result) => setVersion(result))
      .catch(() => {});

    window.electron.app
      .isPackaged()
      .then((result) => setIsPackaged(result))
      .catch(() => {});

    const handleConnectionStatus = (status: number) => {
      if (ConnectionStatus.Authorised & status) {
        setConnectionText(
          <StatusText color={theme.palette.success[mode]}>
            Authorised
          </StatusText>
        );
        startTimer();
        setCredentials();
      } else {
        resetElapsed();
        setIsPlaying(false);
        resetCredentials();

        if (ConnectionStatus.Connected & status) {
          if (needsAuthentication) {
            setConnectionText(
              <StatusText color={theme.palette.warning[mode]}>
                Not authorised
              </StatusText>
            );
          } else {
            setConnectionText(
              <StatusText color={theme.palette.success[mode]}>
                Connected
              </StatusText>
            );
            startTimer();
            setCredentials();
          }
        } else if (ConnectionStatus.Connecting & status) {
          setConnectionText(
            <StatusText color={theme.palette.warning[mode]}>
              Connecting
            </StatusText>
          );
        } else if (
          ConnectionStatus.AuthenticationFailed & status &&
          !(ConnectionStatus.NoPassword & status)
        ) {
          setConnectionText(
            <StatusText color={theme.palette.error[mode]}>
              Authentication failed (check password)
            </StatusText>
          );
        } else if (ConnectionStatus.Disconnected & status) {
          setConnectionText(
            <StatusText color={theme.palette.error[mode]}>
              Disconnected
            </StatusText>
          );
        }
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

    return function cleanup() {
      window.electron.ipcRenderer.removeListener(
        'tron:connection-status',
        handleConnectionStatus
      );
    };
  }, [mode, theme, resetElapsed, needsAuthentication]);

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
              <StatusText>User: {user}</StatusText>
              <br />
              <StatusText>Program: {program.toUpperCase()}</StatusText>
              <br />
              <StatusText>Host: {hostPort}</StatusText>
              <br />
              <StatusText>Elapsed: {formatElapsedTime(elapsedTime)}</StatusText>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </>
  );
};

export default MainStatus;
