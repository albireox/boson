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
import useEventListener from './useEventListener';

interface ReturnType {
  [key: string]: Keyword;
}
export default function useKeywords(
  keywords: string[],
  getLast = true
): ReturnType {
  const channel = 'tron-keywords';

  const [connectionStatus] = useConnectionStatus();

  const [keys, setKeys] = React.useState<{ [key: string]: any }>(
    Object.fromEntries(keywords.map((k) => [k, undefined]))
  );

  const ref = React.useRef({ keywords, getLast });

  const handleEvent = React.useCallback((name: string, keyword: Keyword) => {
    const update: { [key: string]: any } = {};
    // For convenience, we store the keyword as its name
    // (without the actor prefix) and as the actor.keyword name.
    update[keyword.name] = keyword;
    update[name] = keyword;
    setKeys((previous) => ({ ...previous, ...update }));
  }, []);

  useEventListener(channel, handleEvent);

  React.useEffect(() => {
    if (!(connectionStatus & ConnectionStatus.Ready)) return;

    window.electron.tron.subscribeKeywords(
      ref.current.keywords,
      ref.current.getLast
    );
  }, [channel, connectionStatus]);

  if (keywords.length === 0) return {};

  return keys;
}
