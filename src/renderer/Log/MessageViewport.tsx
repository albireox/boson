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
import { ViewportRefType } from '.';
import { useLogConfig, useReplyFilter } from './hooks';
import Message from './Message';

function MessageViewportInner(
  // eslint-disable-next-line @typescript-eslint/ban-types
  props: {},
  ref: React.ForwardedRef<ViewportRefType>
) {
  const theme = useTheme();

  const [filtered, setFiltered] = React.useState<Reply[]>([]);

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

  // New replies from tron.
  useEventListener('tron:received-replies', addReplies, true);

  // Emitted when the user click on clear replies on the menu bar.
  useEventListener('tron:clear-replies', () => setFiltered([]), true);

  React.useImperativeHandle(ref, () => ({
    gotoBottom: () => virtuoso.current?.scrollToIndex(nFiltered.current),
  }));

  React.useEffect(() => {
    // Get all replies when something changes. Since this effect depends on
    // getAllReplies, which depends on addReplies, whic depens on filterReplies,
    // which depends on the config, a change in the config will trigger a full
    // reply reload.

    getAllReplies();
  }, [getAllReplies]);

  React.useEffect(() => {
    // When the component loads, subscribe the window to new replies from tron.
    // The event listener on tron:received-replies listens to them.

    window.electron.tron.subscribe();

    const unload = () => window.electron.tron.unsubscribe();
    window.addEventListener('unload', unload);

    return () => {
      unload();
    };
  }, []);

  React.useEffect(() => {
    // Reset the replies on a time. Since tron in main only keeps
    // maxLogMessages, this effectively ensures that the number of
    // lines doesn't grow too much.
    const interval = setInterval(getAllReplies, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getAllReplies]);

  React.useEffect(() => {
    // When the initial messages load the scroll does not always go to the bottom.
    // This seems to happen mostly when the client is disconnected and there are
    // no new messages. This runs only once when the window loads, after a delay,
    // and sends the viewport to the bottom.
    const timeout = setTimeout(() => {
      virtuoso.current?.scrollToIndex(nFiltered.current);
    }, 1000);

    return () => clearTimeout(timeout);

    // Although it's included here, nFiltered won't trigger a re-render since it's
    // a ref. I think this is a bug in the eslint. If the same code in usePrevious
    // is copied inside the component, it's not necessary to add nFiltered to the
    // dependency list.
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
      increaseViewportBy={400}
    />
  );
}

const MessageViewport = React.forwardRef<ViewportRefType>(MessageViewportInner);
export default MessageViewport;
