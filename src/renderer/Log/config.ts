/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: config.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

const defaultConfig = {
  codes: ['i', 'w', 'e', 'f', ':', 's'],
  searchText: null,
  searchShowMatched: false,
  searchUseRegEx: false,
};

export interface ConfigIface {
  codes: string[];
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
}

const logConfig: LogConfigIface = {
  config: defaultConfig,
  setConfig: () => {},
  toggleCode: () => {},
  setSearchText: () => {},
  setShowMatched: () => {},
  setUseRegEx: () => {},
};

const LogConfigContext = React.createContext<LogConfigIface>(logConfig);

export function createLogConfig(
  config: ConfigIface,
  setConfig: React.Dispatch<React.SetStateAction<ConfigIface>>
): LogConfigIface {
  return {
    config,
    setConfig,
    toggleCode: (item) => {
      const thisCode = item.toLowerCase()[0];
      if (config.codes.includes(thisCode)) {
        setConfig((current) => ({
          ...current,
          ...{ codes: current.codes.filter((code) => code !== thisCode) },
        }));
      } else {
        setConfig((current) => ({
          ...current,
          ...{ codes: [...current.codes, thisCode] },
        }));
      }
    },
    setSearchText: (text) => {
      setConfig((current) => ({
        ...current,
        ...{ searchText: text || null },
      }));
    },
    setShowMatched: (mode) => {
      console.log('here', mode);
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
  };
}

export default LogConfigContext;
export { defaultConfig };
