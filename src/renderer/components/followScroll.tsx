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

export interface ViewPortHandle {
  scrollToBottom(behavior?: 'auto' | 'smooth'): void;
}

export interface ViewPortProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[];
  isAtBottom?: (atBottom: boolean) => void;
  virtuoso?: boolean;
  stick?: boolean;
}

const ViewPort = React.forwardRef<ViewPortHandle, ViewPortProps>(
  ({ children, virtuoso, stick, isAtBottom, ...props }, ref) => {
    const virtuosoRef = React.useRef<VirtuosoHandle>(null);

    const [atBottom, setAtBottom] = React.useState<null | boolean>(null);
    const [autoscroll, setAutoscroll] = React.useState(false);

    const prevCountRef = React.useRef(0);
    const prevCount = prevCountRef.current;

    const handleScroll = React.useCallback(() => {
      // Called when the div scrolls. It is also called when we do an automatic
      // scroll to bottom. If the scroll was automatic, autoScroll = true, in
      // that case we just set it to false. If it's false, we check the scroll
      // position compared with the bottom of the div and if the difference
      // is < 200 (to give it some margin in case of bounce), we say we are at
      // the bottom. We do this with a delay so that we don't do this check
      // while we are actually scrolling. See https://bit.ly/3nICFBE.

      let scrollTimer: any = null;
      if (scrollTimer !== null) clearTimeout(scrollTimer);

      scrollTimer = setTimeout(() => {
        // At this point event is not really current, so we manually get the
        // element to check.
        const currentTarget = document.getElementById('virtuoso');
        const scrollHeight =
          currentTarget!.scrollHeight - currentTarget!.scrollTop;
        const bottom = scrollHeight - currentTarget!.clientHeight < 200;
        if (bottom && autoscroll) setAutoscroll(false);
        if (isAtBottom !== undefined) isAtBottom(bottom);
        setAtBottom(bottom);
      }, 50);
    }, [isAtBottom, autoscroll]);

    const triggerScroll = React.useCallback(() => {
      // Scroll only if we are sticky or already at the bottom and there has
      // been a change in the number of messages.
      let diff = Math.abs(children.length - prevCount);
      if ((stick || atBottom) && diff > 0) {
        prevCountRef.current = children.length;
        const target = document.getElementById('virtuoso');
        if (!target) return;
        const scrollHeight = target.scrollHeight - target.scrollTop;

        setAutoscroll(true);
        virtuosoRef.current?.scrollToIndex({
          index: children.length - 1,
          align: 'end',
          behavior: scrollHeight > 1000 ? 'auto' : 'smooth'
        });
        return;
      }
    }, [stick, atBottom, children.length, prevCount]);

    React.useEffect(() => {
      // This seems to work a bit better than triggering a scroll every time
      // the messages change because there's sometimes a delay between the
      // effect being triggered and the viewport changing. This also limits
      // the number of scrolls a bit.
      let timeout = setTimeout(triggerScroll, 500);
      return () => clearTimeout(timeout);
    }, [triggerScroll]);

    // React.useEffect(() => triggerScroll(), [stick, triggerScroll]);

    if (virtuoso) {
      // We force a full re-render instead of having Virtuoso recalculate
      // the changes. This seems to be as efficient and it avoids caveats
      // with the recalculation of the height of the viewport.
      // See https://github.com/petyosi/react-virtuoso/issues/259.
      return (
        <Virtuoso
          id='virtuoso'
          data={children}
          ref={virtuosoRef}
          style={{ overflowY: stick ? 'hidden' : 'scroll' }}
          itemContent={(index, message) => message}
          onScroll={handleScroll}
          {...props}
        />
      );
    }
    return <div />; // Not implemented
  }
);

export interface FollowScrollHandle {
  update(data: React.ReactNode[]): void;
  clear(): void;
}

export interface FollowScrollProps {
  messages: React.ReactNode[];
  virtuoso?: boolean;
  sticky?: boolean;
}

const FollowScroll = React.forwardRef<FollowScrollHandle, FollowScrollProps>(
  ({ virtuoso, messages, sticky, ...props }, ref) => {
    const classes = useStyles();

    const [atBottom, setAtBottom] = React.useState(true);

    const [stick, setStick] = React.useState<boolean>(sticky || false);
    const [fbColour, setFBColour] = React.useState('default');
    const [fbOpacity, setFBOpacity] = React.useState(0.2);

    React.useEffect(() => {
      // Update style of the button depending on stickiness and bottom state.
      if (stick) {
        setFBColour('secondary');
        setFBOpacity(0.8);
      } else {
        setFBColour(atBottom ? 'secondary' : 'default');
        setFBOpacity(0.2);
      }
    }, [stick, atBottom]);

    return (
      <div className={classes.logBox} id='logBox'>
        <ViewPort
          virtuoso={virtuoso}
          stick={stick}
          isAtBottom={(bottom) => setAtBottom(bottom)}
          style={{ overflowY: stick ? 'hidden' : 'scroll' }}
          {...props}
        >
          {messages}
        </ViewPort>
        <div className={classes.followButton} style={{ opacity: fbOpacity }}>
          <Fab
            size='small'
            onClick={() => setStick(!stick)}
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
