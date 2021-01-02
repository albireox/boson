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

type ValidTabs = 'tcc' | 'apogee' | 'boss';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexGrow: 1,
    padding: 0,
    margin: 0,
    flexDirection: 'row'
  },
  tabs: {
    minWidth: '80px'
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

function MainTab({ icon, ...rest }: { icon: JSX.Element; [key: string]: any }) {
  const classes = useStyles();
  return <Tab className={classes.tab} icon={icon} {...rest} />;
}

async function getTabView(tab: ValidTabs) {
  // Resizes window and returns the appropriate for the tab

  let winSize = await window.api.store.get(`windows.${tab}`);
  let width: number;
  let height: number;

  if (winSize) {
    ({ width, height } = winSize);
  } else {
    ({ width, height } = await window.api.store.get('windows.main'));
  }

  window.api.invoke('window-set-size', 'main', width + 100, height + 50, true);

  let tabView: JSX.Element | null;

  if (tab === 'tcc') {
    tabView = require('./tcc').tccView;
  } else {
    tabView = null;
  }

function ConnectSnackbar(): JSX.Element {
  // Show a reconnect snackbar

  const [open, setOpen] = React.useState<boolean>(false);

  const handleTronStatus = (status: typeof ConnectionStatus) => {
    // Handle tron status changes. Show the snackbar if disconnected.
    if (status === ConnectionStatus.Authorised) {
      setOpen(false);
    } else if (status === ConnectionStatus.Disconnected) {
      setOpen(true);
    }
  };

  React.useEffect(() => {
    window.api.on('tron-status', handleTronStatus);
    handleReconnect(false); // Initial connect
  }, []);

  const handleReconnect = async (openConnect = true) => {
    const result = await autoconnect();
    if (result[0] === false) {
      setOpen(true);
      if (openConnect) await window.api.invoke('window-open', 'connect');
    } else {
      setOpen(false);
    }
  };

  return (
    <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={open}>
      <React.Fragment>
        <Alert severity='warning'>
          <span style={{ padding: '0px 24px 0px 0px' }}>STUI is disconnected</span>
          <Button color='secondary' size='small' onClick={() => handleReconnect(true)}>
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

  const [selectedTab, setSelectedTab] = React.useState<ValidTabs>('tcc');
  const [tabView, setTabView] = React.useState<JSX.Element | null>(null);

  const handleTabChange = (event: BaseSyntheticEvent, value: ValidTabs) => {
    setSelectedTab(value);
  };

  React.useEffect(() => {
    // Update the view of the selected tab when it changes.
    const updateView = async () => setTabView(await getTabView(selectedTab));
    updateView();
  }, [selectedTab]);

  return (
    <Container maxWidth='lg' className={classes.container}>
      <Tabs
        className={classes.tabs}
        orientation='vertical'
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor='secondary'
        textColor='secondary'
      >
        <MainTab
          icon={<Icon icon={telescope} style={{ fontSize: '30px' }} />}
          value='tcc'
          label='TCC'
        />
        <MainTab icon={<Highlight fontSize='large' />} value='apogee' label='APOGEE' />
        <MainTab icon={<Brightness7 fontSize='large' />} value='boss' label='BOSS' />
      </Tabs>
      {tabView}
      <ConnectSnackbar />
    </Container>
  );
}
