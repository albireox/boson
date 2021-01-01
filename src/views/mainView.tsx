/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-30
 *  @Filename: main.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import telescope from '@iconify/icons-mdi/telescope';
import { Icon } from '@iconify/react';
import { Button, Container, makeStyles, Snackbar, Tab, Tabs } from '@material-ui/core';
import { Brightness7, Highlight } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import React, { BaseSyntheticEvent } from 'react';

let ConnectionStatus = window.api.tron.ConnectionStatus;

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexGrow: 1,
    padding: 0,
    margin: 0,
    flexDirection: 'row'
  },
  tabs: {
    width: '80px',
    height: '100vh'
  },
  tab: {
    minWidth: '50px'
  }
}));

async function autoconnect() {
  // Automatically connects to tron. Returns success or failure and whether
  // reconnect is possible.
  const config = await window.api.store.get([
    'user.connection.program',
    'user.connection.user',
    'user.connection.host',
    'user.connection.port'
  ]);
  if (!config.every((x: unknown) => x)) return [false, false];

  const [program, user, host, port] = config;
  const password: string | null = await window.api.invoke(
    'get-password',
    'hub',
    program.toLowerCase()
  );
  if (!password) return [false, false];

  const connResult = await window.api.invoke('tron-connect', host, port);
  if (!connResult === window.api.tron.ConnectionStatus.Connected) return [false, true];

  const authResult = await window.api.invoke('tron-authorise', { program, user, password });
  if (!authResult[0] === true) return [false, true];

  return [true, true];
}

function TabMain({ icon, ...rest }: { icon: JSX.Element; [key: string]: any }) {
  const classes = useStyles();
  return <Tab className={classes.tab} icon={icon} {...rest} />;
}

function TabManager({ tab }: { tab: string }) {
  if (tab === 'tcc') {
    return <div style={{ width: '90%' }}></div>;
  }
  return <div />;
}

function ConnectSnackbar(): JSX.Element {
  const handleReconnect = async () => {
    const result = await autoconnect();
    if (result[0] === false) {
      await window.api.invoke('window-open', 'connect');
    }
  };

  return (
    <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={true}>
      <React.Fragment>
        <Alert severity='warning'>
          <span style={{ padding: '0px 24px 0px 0px' }}>Tron is disconnected</span>
          <Button color='secondary' size='small' onClick={handleReconnect}>
            RECONNECT
          </Button>
        </Alert>
      </React.Fragment>
    </Snackbar>
  );
}

export default function MainView() {
  // Main view

  const classes = useStyles();
  const [selectedTab, setSelectedTab] = React.useState<[number, string]>([0, 'tcc']);
  const [showConnect, setShowConnect] = React.useState<boolean>(false);

  const handleTabChange = (event: BaseSyntheticEvent, value: number) => {
    let label = event.target.textContent.toLowerCase();
    setSelectedTab([value, label]);
  };

  const handleTronStatus = (status: typeof ConnectionStatus) => {
    if (status === ConnectionStatus.Authorised) {
      setShowConnect(false);
    } else if (status === ConnectionStatus.Disconnected) {
      setShowConnect(true);
    }
  };

  React.useEffect(() => {
    autoconnect().then((res) => {
      if (res[0] === false) {
        setShowConnect(true);
      }
    });
    window.api.on('tron-status', handleTronStatus);
  }, []);

  return (
    <Container maxWidth='lg' className={classes.container}>
      {showConnect ? <ConnectSnackbar /> : null}
      <Tabs
        className={classes.tabs}
        orientation='vertical'
        value={selectedTab[0]}
        onChange={handleTabChange}
        indicatorColor='secondary'
        textColor='secondary'
      >
        <TabMain icon={<Icon icon={telescope} style={{ fontSize: '35px' }} />} label='TCC' />
        <TabMain icon={<Highlight fontSize='large' />} label='APOGEE' />
        <TabMain icon={<Brightness7 fontSize='large' />} label='BOSS' />
      </Tabs>
      <TabManager tab={selectedTab[1]} />
    </Container>
  );
}
