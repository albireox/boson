/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: MessageViewport.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Reply from 'main/tron/reply';
import React from 'react';
import { VirtuosoHandle } from 'react-virtuoso';
import { useEventListener, usePrevious } from 'renderer/hooks';
import { ViewportRefType } from '..';
import { useReplyFilter } from '../hooks';
import ColumnReverseViewport from './ColumnReverseViewport';
import VirtuosoViewport from './VirtuosoViewport';

interface MessageViewportProps {
  mode: 'virtuoso' | 'column-reverse';
}

function MessageViewportInner(
  props: MessageViewportProps,
  ref: React.ForwardedRef<ViewportRefType>
) {
  const { mode } = props;

  const [filtered, setFiltered] = React.useState<Reply[]>([]);

  const [isScrolling, setIsScrolling] = React.useState(false);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [triggerToBottom, setTriggerToBottom] = React.useState(true);

  const virtuoso = React.useRef<VirtuosoHandle>(null);

  const [user, setUser] = React.useState('');

  const filterReplies = useReplyFilter();

  const maxLogMessages: number = window.electron.store.get('maxLogMessages');

  const nFiltered = usePrevious<number>(filtered.length);

  const addReplies = React.useCallback(
    (newReplies: Reply[], clear = false) => {
      if (clear) {
        setFiltered(filterReplies(newReplies));
      } else {
        const newFiltered = filterReplies(newReplies);
        if (newFiltered.length > 0) {
          setFiltered((old) => [...old, ...newFiltered]);
        }
      }
      setTriggerToBottom(true);
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
    // getAllReplies, which depends on addReplies, which depends on
    // filterReplies, which depends on the config, a change in the
    // config will trigger a full reply reload.

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
    // When new messages are added react-virtuoso sometimes doesn't fully scroll
    // to bottom and the last line is slightly trimmed. I think this is due to
    // imperfect calculation of the items height and how that fits the viewport.
    // This checks if a new message has been added (which sets triggerToBottom
    // to true) and if we are at bottom and not scrolling, forces a new go to
    // bottom after a short delay. That effectively keeps the viewport at real
    // bottom, but the extra scroll to bottom is slightly noticeable. Still,
    // better than not being able to see half of the last line.

    if (mode !== 'virtuoso') return () => {};

    if (!isAtBottom || isScrolling || !triggerToBottom) return () => {};

    const timeout = setTimeout(() => {
      virtuoso.current?.scrollToIndex(nFiltered.current);
    }, 30);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAtBottom, isScrolling, nFiltered, triggerToBottom, mode]);

  React.useEffect(() => {
    // When the initial messages load the scroll does not always go to the
    // bottom. This seems to happen mostly when the client is disconnected and
    // there are no new messages. This runs only once when the window loads,
    // after a delay, and sends the viewport to the bottom.

    if (mode !== 'virtuoso') return () => {};

    const timeout = setTimeout(() => {
      virtuoso.current?.scrollToIndex(nFiltered.current);
    }, 1000);

    return () => clearTimeout(timeout);

    // Although it's included here, nFiltered won't trigger a re-render since
    // it's a ref. I think this is a bug in the eslint. If the same code in
    // usePrevious is copied inside the component, it's not necessary to add
    // nFiltered to the dependency list.
  }, [nFiltered, mode]);

  React.useEffect(() => {
    const [, theUser, theProgram] = window.electron.tron.getCredentials();
    setUser(`${theProgram}.${theUser}`.toLowerCase());
  }, []);

  if (mode === 'column-reverse') {
    return <ColumnReverseViewport data={filtered} />;
  }

  return (
    <VirtuosoViewport
      ref={virtuoso}
      data={filtered}
      onIsScrolling={setIsScrolling}
      onIsAtBottomState={setIsAtBottom}
      user={user}
    />
  );
}

const MessageViewport = React.forwardRef(MessageViewportInner);
export default MessageViewport;
