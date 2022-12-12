/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: MessageViewport.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useTheme } from '@mui/material';
import Reply from 'main/tron/reply';
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useEventListener } from 'renderer/hooks';
import { useLogConfig, useReplyFilter } from './hooks';
import Message from './Message';

export default function MessageViewport() {
  const theme = useTheme();

  const [replies, setReplies] = React.useState<Reply[]>([]);
  const [buffer, setBuffer] = React.useState<Reply[]>([]);
  const [filtered, setFiltered] = React.useState<Reply[]>([]);

  const { config } = useLogConfig();

  const filterReplies = useReplyFilter();

  const maxLogMessages: number = window.electron.store.get('maxLogMessages');

  const addReplies = React.useCallback((reply: Reply) => {
    setReplies((old) => [...old, reply]);
    setBuffer((old) => [...old, reply]);
  }, []);

  useEventListener('tron:received-reply', addReplies, true);

  useEventListener(
    'tron:clear-replies',
    () => {
      setReplies([]);
      setFiltered([]);
    },
    true
  );

  React.useEffect(() => {
    window.electron.tron
      .getAllReplies()
      .then((reps) => {
        setReplies(reps);
        setBuffer(reps);
        return true;
      })
      .catch(() => {});

    window.electron.tron.subscribe();

    const unload = () => window.electron.tron.unsubscribe();

    window.addEventListener('unload', unload);

    return () => {
      unload();
    };
  }, []);

  React.useEffect(() => {
    if (buffer.length === 0) return () => {};

    const tmpFiltered = filterReplies(buffer);
    if (tmpFiltered.length === 0) return () => {};

    setFiltered((old) => [...old, ...tmpFiltered]);
    setBuffer([]);

    return () => {};
  }, [filterReplies, buffer]);

  React.useEffect(() => {
    setFiltered([]);
    setBuffer((b) => [...replies, ...b]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setReplies((reps) => {
        setFiltered([]);
        setBuffer((b) => [...reps.slice(-maxLogMessages), ...b]);

        return reps.slice(-maxLogMessages);
      });
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Virtuoso
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
