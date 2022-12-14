/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: MessageViewport.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useTheme } from '@mui/material';
import Reply from 'main/tron/reply';
import React from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useEventListener, usePrevious } from 'renderer/hooks';
import { useLogConfig, useReplyFilter } from './hooks';
import Message from './Message';

export default function MessageViewport() {
  const theme = useTheme();

  const [filtered, setFiltered] = React.useState<Reply[]>([]);

  // const nFiltered = usePrevious(filtered.length);

  const virtuoso = React.useRef<VirtuosoHandle>(null);

  const { config } = useLogConfig();

  const filterReplies = useReplyFilter();

  const maxLogMessages: number = window.electron.store.get('maxLogMessages');

  const nFiltered = usePrevious<number>(filtered.length);

  const addReplies = React.useCallback(
    (newReplies: Reply[], clear = false) => {
      if (clear) {
        setFiltered(filterReplies(newReplies));
      } else {
        setFiltered((old) => [...old, ...filterReplies(newReplies)]);
      }
    },
    [filterReplies]
  );

  const getAllReplies = React.useCallback(() => {
    window.electron.tron
      .getAllReplies(maxLogMessages)
      .then((reps) => addReplies(reps, true))
      .catch(() => {});
  }, [addReplies, maxLogMessages]);

  useEventListener('tron:received-replies', addReplies, true);

  useEventListener('tron:clear-replies', () => setFiltered([]), true);

  React.useEffect(() => {
    getAllReplies();
    window.electron.tron.subscribe();

    const unload = () => window.electron.tron.unsubscribe();
    window.addEventListener('unload', unload);

    return () => {
      unload();
    };
  }, [getAllReplies]);

  React.useEffect(() => {
    const interval = setInterval(getAllReplies, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getAllReplies]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      virtuoso.current?.scrollToIndex(nFiltered.current);
    }, 1000);

    return () => clearTimeout(timeout);

    // Although it's included here, nFiltered won't trigger a re-render.
  }, [nFiltered]);

  return (
    <Virtuoso
      ref={virtuoso}
      style={{
        height: '100%',
        width: '100%',
        overflowX: 'auto',
        overflowY: 'auto',
      }}
      totalCount={filtered.length}
      data={filtered}
      overscan={1000}
      itemContent={(index) => {
        return (
          <Message
            reply={filtered[index]}
            theme={theme}
            searchText={config.searchText}
            searchUseRegEx={config.searchUseRegEx}
            wrap={config.wrap}
          />
        );
      }}
      followOutput='auto'
      alignToBottom
      atBottomThreshold={400}
      increaseViewportBy={500}
    />
  );
}
