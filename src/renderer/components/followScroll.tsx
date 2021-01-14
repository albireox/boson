/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-13
 *  @Filename: followScroll.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/**
 * TODO: When using Virtuoso, if one reduces the maximum number of messages
 * (say from 100,000 to 1,000), the height of the window doesn't change and
 * the scroll has a lot of blank space at the bottom. The stick to bottom
 * works because in Virtuoso mode it looks for the item with the latest index,
 * but manual scrolling is mostly messed up. Not sure how to fix it; maybe
 * force a reload of the entire Virtuoso tag?
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
}

export interface FollowScrollHandle {
  update(nodes: React.ReactNode[]): void;
  reset(nodes?: React.ReactNode[]): void;
}

const FollowScroll = React.forwardRef<FollowScrollHandle, FollowScrollProps>(
  ({ virtuoso, maxCount, ...props }, ref) => {
    const classes = useStyles();

    const [messages, setMessages] = React.useState<React.ReactNode[]>([]);

    const [atBottom, setAtBottom] = React.useState(true);
    const [autoScroll, setAutoScroll] = React.useState(true);

    const [stickToBottom, setStickToBottom] = React.useState(false);
    const [fbColour, setFBColour] = React.useState('default');
    const [fbOpacity, setFBOpacity] = React.useState(0.2);

    const virtuosoRef = React.useRef<VirtuosoHandle>(null);
    virtuosoRef.current?.adjustForPrependedItems(-10);
    let scrollTimer: any = null;

    React.useImperativeHandle(ref, () => ({
      update: (data) => {
        setMessages((prev) => [...prev.slice(-(maxCount || 0)), ...data]);
      },
      reset: (data) =>
        data ? setMessages(data.slice(-(maxCount || 0))) : setMessages([])
    }));

    React.useEffect(() => {
      if (atBottom || stickToBottom) {
        scrollToBottom();
        setFBColour('secondary');
      } else {
        setFBColour('default');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    // Called when the div scrolls. It is also called when we do an automatic
    // scroll to bottom. If the scroll was automatic, autoScroll = true, in that
    // case we just set it to false. If it's false, we check the scroll position
    // compared with the bottom of the div and if the difference is < 50 (to
    // give it some margin in case of bounce), we say we are at the bottom.
    // We do this with a delay so that we don't do this check while we are
    // actually scrolling. See https://bit.ly/3nICFBE.
    const handleScroll = (): any => {
      if (autoScroll) {
        setAutoScroll(false);
        setFBColour('secondary');
        return;
      }

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
        const bottom = scrollHeight - currentTarget.clientHeight < 100;

        // If we are at the bottom, refresh all the messages since we
        // haven't been updating them while scrolled up.
        if (bottom || stickToBottom) {
          setFBColour('secondary');
        } else {
          setFBColour('default');
        }
        setAtBottom(bottom);
      }, 50);
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
        {getMessageViewer()}
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
