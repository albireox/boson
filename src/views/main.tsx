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
import { Box, Container, makeStyles, Tab, Tabs } from '@material-ui/core';
import { Favorite, PersonPin } from '@material-ui/icons';
import React, { BaseSyntheticEvent } from 'react';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexGrow: 1,
    padding: 0,
    margin: 0,
    flexDirection: 'row'
  },
  tabs: {
    width: '100px',
    height: '100vh'
  },
  tab: {
    minWidth: '50px'
  }
}));

function TabMain({ icon, ...rest }: { icon: JSX.Element; [key: string]: any }) {
  const classes = useStyles();
  return <Tab className={classes.tab} icon={icon} {...rest} />;
}

function TabManager({ tab }: { tab: string }) {
  if (tab === 'tcc') {
    return <div style={{ width: '90%' }}>TCC</div>;
  }
  return <div />;
}

export default function MainView() {
  const classes = useStyles();
  const [tabsValue, setTabsValue] = React.useState(0);
  const [selectedTab, setSelectedTab] = React.useState<string>('tcc');

  const handleChange = (event: BaseSyntheticEvent, value: number) => {
    let label = event.target.textContent.toLowerCase();
    setTabsValue(value);
    setSelectedTab(label);
  };

  return (
    <Container maxWidth='lg' className={classes.container}>
      <Tabs
        className={classes.tabs}
        orientation='vertical'
        value={tabsValue}
        onChange={handleChange}
        indicatorColor='secondary'
        textColor='secondary'
      >
        <TabMain icon={<Icon icon={telescope} style={{ fontSize: '30px' }} />} label='TCC' />
        <TabMain icon={<Favorite />} label='FAVORITES' />
        <TabMain icon={<PersonPin />} label='NEARBY' />
      </Tabs>
      <TabManager tab={selectedTab} />
    </Container>
  );
}
