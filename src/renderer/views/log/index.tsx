/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { SxProps } from '@mui/system';
import { ReplyCode } from 'main/tron';
import { createContext, Fragment, useState } from 'react';
import CommandInput from './input';
import MenuBar from './menubar';
import Messages from './message';

const styles = {
  menubar: {
    p: '2px 8px 8px',
    display: 'flex',
    flexDirection: 'row'
  } as SxProps
};

export interface ConfigState {
  levels: ReplyCode[];
  nMessages: number;
  seenActors: string[];
  selectedActors: string[];
}

export interface SearchState {
  searchOn: boolean;
  searchExpr: string;
  limit: boolean;
  regExp: boolean;
}

const IConfigState = {
  levels: [ReplyCode.Info, ReplyCode.Warning, ReplyCode.Error, ReplyCode.Failed, ReplyCode.Done],
  nMessages: 0, // Not in use
  seenActors: [],
  selectedActors: []
};

const ISearchState = {
  searchOn: false,
  searchExpr: '',
  limit: false,
  regExp: false
};

export const ConfigContext = createContext<ConfigState>(IConfigState);
export const SearchContext = createContext<SearchState>(ISearchState);

export function LogView() {
  const [config, setConfig] = useState<ConfigState>(IConfigState);
  const [search, setSearch] = useState<SearchState>(ISearchState);

  const onConfigUpdate = (newConfig: Partial<ConfigState>) => {
    setConfig({ ...config, ...newConfig });
  };

  const onSearchUpdate = (newSearch: Partial<SearchState>) => {
    setSearch({ ...search, ...newSearch });
  };

  return (
    <Fragment>
      <ConfigContext.Provider value={config}>
        <SearchContext.Provider value={search}>
          <MenuBar
            sx={styles.menubar}
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
