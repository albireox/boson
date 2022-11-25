/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: MessageViewport.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, useTheme } from '@mui/material';
import React from 'react';
import { Components, Virtuoso } from 'react-virtuoso';
import Reply from '../../main/tron/reply';
import { useLogConfig, useReplyFilter } from './hooks';
import Message from './Message';

const Scroller: Components<{ showScrollBar: boolean }>['Scroller'] =
  React.forwardRef(({ style, context, ...props }, ref) => {
    // Scroller component that doesn't show the scrollbar while the
    // scroll is at the bottom of the viewport.
    return (
      <Box
        sx={{
          '&::-webkit-scrollbar': {
            display: context?.showScrollBar ? undefined : 'none',
          },
        }}
        style={style}
        ref={ref}
        {...props}
      />
    );
  });

export default function MessageViewport() {
  const theme = useTheme();

  const [replies, setReplies] = React.useState<Reply[]>([]);
  const [buffer, setBuffer] = React.useState<Reply[]>([]);
  const [filtered, setFiltered] = React.useState<Reply[]>([]);

  const { config } = useLogConfig();

  const filterReplies = useReplyFilter();

  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = React.useState<boolean>(false);

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
    if (buffer.length === 0) return;

    setFiltered((old) => [...old, ...filterReplies(buffer)]);
    setBuffer([]);
  }, [filterReplies, buffer]);

  React.useEffect(() => {
    setFiltered([]);
    setBuffer((b) => [...replies, ...b]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return (
    <Virtuoso
      style={{
        height: '100%',
        width: '100%',
      }}
      totalCount={filtered.length}
      atBottomStateChange={(aB) => setIsAtBottom(aB)}
      isScrolling={(iS) => setIsScrolling(iS)}
      data={filtered}
      overscan={1000}
      itemContent={(index) => {
        return <Message reply={filtered[index]} theme={theme} />;
      }}
      followOutput='auto'
      alignToBottom
      atBottomThreshold={400}
      defaultItemHeight={22}
      context={{ showScrollBar: isScrolling && !isAtBottom }}
      components={{ Scroller }}
    />
  );
}
