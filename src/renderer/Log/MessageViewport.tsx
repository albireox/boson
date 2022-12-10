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

  useEventListener('tron:clear-replies', () => {
    setReplies([]);
    setFiltered([]);
  });

  React.useEffect(() => {
    const addReplies = (reply: Reply) => {
      setReplies((old) => [...old, reply]);
      setBuffer((old) => [...old, reply]);
    };

    window.electron.tron
      .getAllReplies()
      .then((reps) => {
        setReplies(reps);
        setBuffer(reps);
        return true;
      })
      .catch(() => {});

    window.electron.ipcRenderer.removeAllListeners('tron:received-reply');
    window.electron.ipcRenderer.on('tron:received-reply', addReplies);
    window.electron.tron.subscribe();

    const unload = () => {
      window.electron.ipcRenderer.removeListener(
        'tron:received-reply',
        addReplies
      );
      window.electron.tron.unsubscribe();
    };

    window.addEventListener('unload', unload);

    return () => {
      unload();
    };
  }, []);

  React.useEffect(() => {
    if (buffer.length === 0) return () => {};

    const tmpFiltered = filterReplies(buffer);
    if (tmpFiltered.length === 0) return () => {};

    const timeout = setTimeout(() => {
      setFiltered((old) => [...old, ...tmpFiltered]);
      setBuffer([]);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
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
    />
  );
}
