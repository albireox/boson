/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { makeStyles } from '@material-ui/core';
import React, { Fragment } from 'react';
import CommandInput from './input';
import MenuBar from './menubar';
import Messages from './message';

const useStyles = makeStyles((theme) => ({
  menubar: {
    padding: '2px 8px 8px'
  }
}));

export interface ConfigState {
  levels?: string[];
  nMessages?: number;
}

export const ConfigContext = React.createContext<ConfigState>({});

export function LogView() {
  const classes = useStyles();

  const [config, setConfig] = React.useState<ConfigState>({
    levels: ['info', 'warning', 'error'],
    nMessages: 10000
  });

  const onConfigUpdate = (newConfig: ConfigState) => {
    setConfig({ ...config, ...newConfig });
  };

  return (
    <Fragment>
      <ConfigContext.Provider value={config}>
        <MenuBar className={classes.menubar} onConfigUpdate={onConfigUpdate} />
        <Messages />
      </ConfigContext.Provider>
      <CommandInput />
    </Fragment>
  );
}

export default LogView;
