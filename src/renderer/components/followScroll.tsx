/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-13
 *  @Filename: followScroll.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Fab, makeStyles } from '@material-ui/core';
import { SettingsEthernet } from '@material-ui/icons';
import React from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

const useStyles = makeStyles((theme) => ({
  logBox: {
    flexGrow: 1,
    height: '80%',
    width: '100vw',
    padding: '2px 8px 4px'
  },
  followButton: {
    position: 'fixed',
    right: 15,
    bottom: 60,
    zIndex: 60000
  }
}));

export interface FollowScrollProps {
  virtuoso?: boolean;
  maxCount?: number;
  data: React.ReactNode[];
}

export interface FollowScrollHandle {
  update(nodes: React.ReactNode[]): void;
}

const FollowScroll = React.forwardRef<FollowScrollHandle, FollowScrollProps>(
  ({ virtuoso, maxCount, data, ...props }, ref) => {
    const classes = useStyles();

    const [messages, setMessages] = React.useState<React.ReactNode[]>(data);
    const [viewer, setViewer] = React.useState<React.ReactNode>(<div />);

    const [atBottom, setAtBottom] = React.useState(true);
    const [autoScroll, setAutoScroll] = React.useState(false);
    const [forceRefresh, setForceRefresh] = React.useState(false);

    const [stickToBottom, setStickToBottom] = React.useState(false);
    const [fbColour, setFBColour] = React.useState('default');
    const [fbOpacity, setFBOpacity] = React.useState(0.2);

    const virtuosoRef = React.useRef<VirtuosoHandle>(null);

    let scrollTimer: any = null;

    const refresh = () => setViewer(getMessageViewer());

    React.useImperativeHandle(ref, () => ({
      update: (data) => {
        if (!maxCount || messages.length + data.length <= maxCount) {
          setMessages((prev) => [...prev, ...data]);
        } else {
          setMessages((prev) => [
            ...prev.slice(-maxCount + data.length),
            ...data
          ]);
        }
      }
    }));

    // If the data changes upstream, update messages.
    React.useEffect(() => {
      setMessages(data);
      // In this case we want to force a refresh even if we are scrolling,
      // but we don't want to scroll to bottom after it.
      setForceRefresh(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // We add another effect to ensure that the scrolling and refresh happens
    // once the messages have been updated.
    React.useEffect(() => {
      if (atBottom || stickToBottom) {
        // We force a full re-render instead of having Virtuoso recalculate
        // the changes. This seems to be as efficient and it avoids caveats
        // with the recalculation of the height of the viewport.
        // See https://github.com/petyosi/react-virtuoso/issues/259.
        refresh();
        scrollToBottom();
        setFBColour('secondary');
      } else if (forceRefresh) {
        refresh();
      } else {
        // While we are scrolling we don't want to refresh the viewport
        // because it changes the current contents.
        setFBColour('default');
      }
      setForceRefresh(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    // Called when the div scrolls. It is also called when we do an automatic
    // scroll to bottom. If the scroll was automatic, autoScroll = true, in that
    // case we just set it to false. If it's false, we check the scroll position
    // compared with the bottom of the div and if the difference is < 200 (to
    // give it some margin in case of bounce), we say we are at the bottom.
    // We do this with a delay so that we don't do this check while we are
    // actually scrolling. See https://bit.ly/3nICFBE.
    const handleScroll = (): any => {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
      scrollTimer = setTimeout(() => {
        // At this point event is not really current, so we manually get the
        // element to check.
        const currentTarget = virtuoso
          ? document.getElementById('virtuoso')
          : document.getElementById('logBox');
        if (!currentTarget) return;

        const scrollHeight =
          currentTarget.scrollHeight - currentTarget.scrollTop;
        const bottom = scrollHeight - currentTarget.clientHeight < 200;

        if (bottom || stickToBottom) {
          // Refresh viewport with messages that may have arrived while we
          // were scrolling.
          refresh();
          setFBColour('secondary');
          setAutoScroll(false);
        } else if (autoScroll) {
          setFBColour('secondary');
        } else {
          setFBColour('default');
        }
        setAtBottom(bottom);
      }, 100);
    };

    const scrollToBottom = () => {
      if (!virtuoso) {
        document.getElementById('scrollAnchor')?.scrollIntoView();
      } else {
        if (virtuosoRef && virtuosoRef.current) {
          virtuosoRef!.current!.scrollToIndex({
            index: messages.length - 1,
            align: 'end',
            behavior: 'auto'
          });
        }
      }
      // Indicate the following scroll was not done by the user.
      setAutoScroll(true);
    };

    const handleFollowButtonClick = (event: React.SyntheticEvent) => {
      event.preventDefault();

      if (stickToBottom) {
        setStickToBottom(false);
        setFBOpacity(0.2);
      } else {
        setStickToBottom(true);
        setFBOpacity(0.8);
        setFBColour('secondary');
        scrollToBottom();
      }
    };

    const getMessageViewer = () => {
      if (virtuoso) {
        return (
          <Virtuoso
            id='virtuoso'
            onScroll={handleScroll}
            style={{ overflowY: stickToBottom ? 'hidden' : 'scroll' }}
            ref={virtuosoRef}
            data={messages}
            itemContent={(index, message) => message}
          />
        );
      } else {
        return (
          <div>
            {messages}
            <div id='scrollAnchor'></div>
          </div>
        );
      }
    };

    return (
      <div
        className={classes.logBox}
        id='logBox'
        onScroll={virtuoso ? undefined : handleScroll}
        style={{ overflowY: stickToBottom ? 'hidden' : 'scroll' }}
      >
        {viewer}
        <div className={classes.followButton} style={{ opacity: fbOpacity }}>
          <Fab
            size='small'
            onClick={handleFollowButtonClick}
            color={fbColour as any}
          >
            <SettingsEthernet style={{ transform: 'rotate(90deg)' }} />
          </Fab>
        </div>
      </div>
    );
  }
);

export default FollowScroll;
