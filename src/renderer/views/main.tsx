/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-30
 *  @Filename: main.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import telescope from '@iconify/icons-mdi/telescope';
import { Icon } from '@iconify/react';
import { Brightness7, Highlight } from '@mui/icons-material';
import { Alert, Button, Container, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import { ConnectionStatus } from 'main/tron';
import * as React from 'react';
import { BaseSyntheticEvent } from 'react';
import TCCView from './TCC';

type ValidTabs = 'tcc' | 'apogee' | 'boss';

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
  switch (connResult) {
    case ConnectionStatus.Connected:
      break;
    case ConnectionStatus.Authorised:
      return [true, true];
    default:
      return [false, true];
  }

  const authResult = await window.api.invoke('tron-authorise', {
    program,
    user,
    password
  });
  if (!authResult[0] === true) return [false, true];

  return [true, true];
}

function MainTab({ icon, ...rest }: { icon: JSX.Element; [key: string]: any }) {
  return (
    <Tab
      // sx={{
      //   minWidth: '50px'
      // }}
      icon={icon}
      {...rest}
    />
  );
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

  let TabView: React.FunctionComponent;
  if (tab === 'tcc') {
    TabView = TCCView;
  } else {
    TabView = () => (
      <Typography variant='h2' style={{ textAlign: 'center', top: '40%' }}>
        {tab.toUpperCase()}
      </Typography>
    );
  }
  return React.createElement(TabView, {});
}

function ConnectSnackbar(): JSX.Element {
  // Show a reconnect snackbar

  const [open, setOpen] = React.useState<boolean>(false);

  const handleTronStatus = (status: ConnectionStatus) => {
    // Handle tron status changes. Show the snackbar if disconnected.
    if (status === ConnectionStatus.Authorised) {
      setOpen(false);
    } else if (status === ConnectionStatus.Disconnected) {
      setOpen(true);
    }
  };

  React.useEffect(() => {
    window.api.on('tron-status', handleTronStatus);
    window.api.store.get('user.autoconnect').then((res: boolean) => {
      if (res) handleReconnect(false); // Initial connect
    });
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
      <Alert severity='warning'>
        <span style={{ padding: '0px 24px 0px 0px' }}>STUI is disconnected</span>
        <Button color='secondary' size='small' onClick={() => handleReconnect(true)}>
          RECONNECT
        </Button>
      </Alert>
    </Snackbar>
  );
}

export default function MainView() {
  // Main view

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
    <Container
      disableGutters
      sx={{
        display: 'flex',
        padding: 0,
        margin: 0,
        paddingLeft: 0,
        flexDirection: 'row',
        height: '100%'
      }}
    >
      <Tabs
        sx={{
          minWidth: '80px',
          padding: 0,
          margin: 0
        }}
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
      <div
        css={{
          width: '100%',
          padding: '0px 24px 24px 16px'
        }}
      >
        {tabView}
      </div>
      <ConnectSnackbar />
    </Container>
  );
}
