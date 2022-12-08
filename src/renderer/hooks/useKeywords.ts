/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-25
 *  @Filename: useKeywords.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConnectionStatus, Keyword } from 'main/tron/types';
import React from 'react';
import useConnectionStatus from './useConnectionStatus';

interface ReturnType {
  [key: string]: Keyword;
}
export default function useKeywords(
  actor: string,
  keywords: string[],
  getKeys = true
): ReturnType {
  const [channel] = React.useState<string>(
    `tron-keywords-${window.electron.tools.getUUID()}`
  );

  const connectionStatus = useConnectionStatus();

  const [keys, setKeys] = React.useState<{ [key: string]: any }>(
    Object.fromEntries(keywords.map((k) => [k, undefined]))
  );

  const ref = React.useRef({ actor, keywords, getKeys });

  const handleEvent = React.useCallback((keyword: Keyword) => {
    const update: { [key: string]: any } = {};
    update[keyword.name] = keyword;
    setKeys((previous) => ({ ...previous, ...update }));
  }, []);

  React.useEffect(() => {
    if (!(connectionStatus & ConnectionStatus.Ready)) return () => {};

    window.electron.tron.subscribeKeywords(
      channel,
      ref.current.actor,
      ref.current.keywords,
      ref.current.getKeys
    );

    window.electron.ipcRenderer.on(channel, handleEvent);

    const unload = () => {
      window.electron.tron.unsubscribeKeywords(channel);
    };
    window.addEventListener('unload', unload);

    return function cleanup() {
      unload();
    };
  }, [channel, handleEvent, connectionStatus]);

  if (keywords.length === 0) return {};

  return keys;
}
