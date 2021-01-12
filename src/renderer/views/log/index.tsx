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
    padding: '2px 8px 8px',
    display: 'flex',
    flexDirection: 'row'
  }
}));

export interface ConfigState {
  levels?: string[];
  nMessages?: number;
  seenActors?: string[];
  selectedActors?: string[];
}

export interface SearchState {
  searchOn?: boolean;
  searchExpr?: string | undefined;
  limit?: boolean;
  regExp?: boolean;
}

const IConfigState = {
  levels: ['info', 'warning', 'error'],
  nMessages: 10000,
  seenActors: [],
  selectedActors: []
};

const ISearchState = {
  searchOn: false,
  searchExpr: undefined,
  limit: false,
  regExp: false
};

export const ConfigContext = React.createContext<ConfigState>(IConfigState);
export const SearchContext = React.createContext<SearchState>(ISearchState);

export function LogView() {
  const classes = useStyles();

  const [config, setConfig] = React.useState<ConfigState>(IConfigState);
  const [search, setSearch] = React.useState<SearchState>(ISearchState);

  const onConfigUpdate = (newConfig: ConfigState) => {
    setConfig({ ...config, ...newConfig });
  };

  const onSearchUpdate = (newSearch: SearchState) => {
    console.log(newSearch);
    setSearch(newSearch);
  };

  return (
    <Fragment>
      <ConfigContext.Provider value={config}>
        <SearchContext.Provider value={search}>
          <MenuBar
            className={classes.menubar}
            onConfigUpdate={onConfigUpdate}
            onSearchUpdate={onSearchUpdate}
          />
          <Messages onConfigUpdate={onConfigUpdate} />
        </SearchContext.Provider>
      </ConfigContext.Provider>
      <CommandInput />
    </Fragment>
  );
}

export default LogView;
