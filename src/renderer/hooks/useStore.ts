/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-15
 *  @Filename: useStore.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

export default function useStore<T>(
  key: string,
  subscribe = true
): [T, (newValue: T) => void] {
  const INITIAL_VALUE = window.electron.store.get(key);
  const [value, setValue] = React.useState<T>(INITIAL_VALUE);

  const setConfigValue = (newValue: T) => {
    setValue(newValue);
    window.electron.store.set(key, newValue);
  };

  const channel = window.electron.tools.getUUID();

  React.useEffect(() => {
    if (!subscribe) return () => {};

    const handleUpdate = (newValue: T) => {
      setValue(newValue);
    };

    window.electron.store.subscribe(key, channel);
    window.electron.ipcRenderer.on(channel, handleUpdate);

    return () => {
      window.electron.store.unsubscribe(channel);
      window.electron.ipcRenderer.removeListener(channel, handleUpdate);
    };
  }, [channel, key, subscribe]);

  return [value, setConfigValue];
}
