/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-15
 *  @Filename: useStore.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

interface UseStoreOptions {
  mode?: 'normal' | 'default' | 'merge';
  subscribe?: boolean;
}

type ReturnType<T> = [T, (newValue: T) => void];

export default function useStore<T>(
  key: string,
  opts?: UseStoreOptions
): ReturnType<T> {
  const { mode = 'normal', subscribe = true } = opts ?? {};

  const INITIAL_VALUE = window.electron.store.get(key, mode);
  const [value, setValue] = React.useState<T>(INITIAL_VALUE);

  const setConfigValue = (newValue: T) => {
    setValue(newValue);
    window.electron.store.set(key, newValue);
  };

  const channel = window.electron.tools.getUUID();

  React.useEffect(() => {
    if (!subscribe || mode === 'default') return () => {};

    const handleUpdate = (newValue: T) => {
      if (mode === 'normal') {
        setValue(newValue);
      } else if (mode === 'merge') {
        const DEFAULT_VALUE = window.electron.store.get(key, 'default') ?? {};
        setValue({ ...DEFAULT_VALUE, ...newValue });
      }
    };

    window.electron.store.subscribe(key, channel);
    window.electron.ipcRenderer.on(channel, handleUpdate);

    return () => {
      window.electron.store.unsubscribe(channel);
      window.electron.ipcRenderer.removeListener(channel, handleUpdate);
    };
  }, [channel, key, subscribe, mode]);

  return [value, setConfigValue];
}
