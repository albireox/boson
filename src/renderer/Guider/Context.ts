/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: Context.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

interface GuiderConfig {
  colormap: string;
  scale: string;
  scalelim: string;
  zoom: number;
  selectedFrame: string;
}

const defaultGuiderConfig: GuiderConfig = {
  colormap: window.electron.store.get('guider.colormap'),
  scale: window.electron.store.get('guider.scale'),
  scalelim: window.electron.store.get('guider.scalelim'),
  zoom: 1,
  selectedFrame: '',
};

interface GuiderContextType {
  config: GuiderConfig;
  setConfig: React.Dispatch<React.SetStateAction<GuiderConfig>>;
  setParam: (param: string, newValue: any, save: boolean) => void;
  setSelectedFrame: (frame: string) => void;
}

const defaultContext: GuiderContextType = {
  config: defaultGuiderConfig,
  setConfig: () => {},
  setParam: () => {},
  setSelectedFrame: () => {},
};

const GuiderContext = React.createContext<GuiderContextType>(defaultContext);

function prepareGuiderContext(
  config: GuiderConfig,
  setConfig: React.Dispatch<React.SetStateAction<GuiderConfig>>
) {
  return {
    config,
    setConfig,
    setParam: (param: string, newValue: any, save = false) => {
      setConfig((current) => ({
        ...current,
        [param]: newValue,
      }));
      if (save) {
        window.electron.store.set(`guider.${param}`, newValue);
      }
    },
    setSelectedFrame: (frame: string) =>
      setConfig((current) => ({ ...current, selectedFrame: frame })),
  };
}

export default GuiderContext;
export { defaultGuiderConfig, prepareGuiderContext, GuiderConfig };
