/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: config.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

const defaultConfig = {
  codes: new Set(['i', 'w', 'e', 'f', ':', 's']),
  actors: new Set([]),
  searchText: null,
  searchShowMatched: false,
  searchUseRegEx: false,
};

export interface ConfigIface {
  codes: Set<string>;
  actors: Set<string>;
  searchText: string | null;
  searchShowMatched: boolean;
  searchUseRegEx: boolean;
}

export interface LogConfigIface {
  config: ConfigIface;
  setConfig: React.Dispatch<React.SetStateAction<ConfigIface>>;
  setSearchText: (text: string) => void;
  setShowMatched: (mode: boolean) => void;
  setUseRegEx: (mode: boolean) => void;
  toggleCode: (code: string) => void;
  toggleActor: (actor: string) => void;
  clearActors: () => void;
}

const logConfig: LogConfigIface = {
  config: defaultConfig,
  setConfig: () => {},
  toggleCode: () => {},
  setSearchText: () => {},
  setShowMatched: () => {},
  setUseRegEx: () => {},
  toggleActor: () => {},
  clearActors: () => {},
};

const LogConfigContext = React.createContext<LogConfigIface>(logConfig);

export function createLogConfig(
  config: ConfigIface,
  setConfig: React.Dispatch<React.SetStateAction<ConfigIface>>
): LogConfigIface {
  return {
    config,
    setConfig,
    toggleCode: (code) => {
      const codeL = code.toLowerCase()[0];
      setConfig((current) => {
        const codes = new Set(current.codes);
        codes.has(codeL) ? codes.delete(codeL) : codes.add(codeL);
        return {
          ...current,
          ...{ codes },
        };
      });
    },
    setSearchText: (text) => {
      setConfig((current) => {
        if (current.searchText === text || (!current.searchText && !text))
          return current;

        return {
          ...current,
          ...{ searchText: text || null },
        };
      });
    },
    setShowMatched: (mode) => {
      setConfig((current) => ({
        ...current,
        ...{ searchShowMatched: mode },
      }));
    },
    setUseRegEx: (mode) => {
      setConfig((current) => ({
        ...current,
        ...{ searchUseRegEx: mode },
      }));
    },
    toggleActor: (actor) => {
      setConfig((current) => {
        const actors = new Set(current.actors);
        actors.has(actor) ? actors.delete(actor) : actors.add(actor);
        return {
          ...current,
          ...{ actors },
        };
      });
    },
    clearActors: () => {
      setConfig((current) => ({ ...current, ...{ actors: new Set() } }));
    },
  };
}

export default LogConfigContext;
export { defaultConfig };
