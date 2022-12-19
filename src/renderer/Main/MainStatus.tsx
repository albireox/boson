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
import { useConnectionStatus, useStore } from 'renderer/hooks';
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

type ElapsedTimeProps = {
  isPlaying: boolean;
  initialTime: number;
};

function ElapsedTime(props: ElapsedTimeProps) {
  const { isPlaying, initialTime } = props;

  const [elapsedTime, setElapsedTime] = React.useState(0);

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

  React.useEffect(() => {
    setElapsedTime((Date.now() - initialTime) / 1000);
  }, [initialTime]);

  React.useEffect(() => {
    const interval = setInterval(
      () => setElapsedTime((current) => current + 1),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  return <span>{formatElapsedTime(isPlaying ? elapsedTime : 0)}</span>;
}

const MainStatus = () => {
  const theme = useTheme();
  const { mode } = theme.palette;

  const [connectionStatus] = useConnectionStatus();

  const [version, setVersion] = useState<string | undefined>(undefined);
  const [isPackaged, setIsPackaged] = useState<boolean | undefined>(undefined);

  const [connectionText, setConnectionText] = useState<React.ReactElement>(
    <StatusText color={theme.palette.text.disabled}>Unknown</StatusText>
  );

  const [isElapsedRunning, setIsElapsedRunning] = useState(false);
  const [connectionTime, setConnectionTime] = useState(-1);

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
          return setConnectionTime(value.getTime());
        })
        .catch(() => {});
      setIsElapsedRunning(true);
    };

    const setCredentials = () => {
      const [, us, pr, ho, po] = window.electron.tron.getCredentials();
      setUser(us);
      setProgram(pr);
      setHost(ho);
      setPort(po.toString());
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

    if (ConnectionStatus.Authorised & connectionStatus) {
      setConnectionText(
        <StatusText color={theme.palette.success[mode]}>Authorised</StatusText>
      );
      startTimer();
      setCredentials();
    } else {
      setIsElapsedRunning(false);
      resetCredentials();

      if (ConnectionStatus.Connected & connectionStatus) {
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
      } else if (ConnectionStatus.Connecting & connectionStatus) {
        setConnectionText(
          <StatusText color={theme.palette.warning[mode]}>
            Connecting
          </StatusText>
        );
      } else if (
        ConnectionStatus.AuthenticationFailed & connectionStatus &&
        !(ConnectionStatus.NoPassword & connectionStatus)
      ) {
        setConnectionText(
          <StatusText color={theme.palette.error[mode]}>
            Authentication failed (check password)
          </StatusText>
        );
      } else if (ConnectionStatus.Disconnected & connectionStatus) {
        setConnectionText(
          <StatusText color={theme.palette.error[mode]}>
            Disconnected
          </StatusText>
        );
      }
    }
  }, [mode, theme, needsAuthentication, connectionStatus]);

  return (
    <>
      <Stack
        direction='column'
        spacing={1}
        width='100%'
        alignItems='center'
        height='100%'
      >
        <img width='30%' alt='icon' src={icon} />
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
              <StatusText>
                Elapsed:{' '}
                <ElapsedTime
                  isPlaying={isElapsedRunning}
                  initialTime={connectionTime}
                />
              </StatusText>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </>
  );
};

export default MainStatus;
