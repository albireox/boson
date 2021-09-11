/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-13
 *  @Filename: followScroll.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { css } from '@emotion/react';
import { SettingsEthernet } from '@mui/icons-material';
import { Fab } from '@mui/material';
import * as React from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

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
    const [scrolling, setScrolling] = React.useState(false);
    const [manuallyScrolled, setManuallyScrolled] = React.useState(false);

    const handleScroll = () => {
      // Called when the div scrolls. It is also called when we do an automatic
      // scroll to bottom. We check the scroll position compared with the
      // bottom of the div and if the difference is < 50 (to give it some
      // margin in case of bounce), we say we are at the bottom. We do this
      // with a delay so that we don't do this check while we are actually
      // scrolling. See https://bit.ly/3nICFBE.
      const currentTarget = document.getElementById(
        virtuoso ? 'virtuoso' : 'messages-container'
      );
      const scrollHeight =
        currentTarget!.scrollHeight - currentTarget!.scrollTop;
      const bottom = scrollHeight - currentTarget!.clientHeight < 50;

      // Report if we are at bottom to parent. In this case, if we aren't
      // manually scrolled then we are by definition at bottom so we report
      // that. This prevents the at-bottom button to briefly change to white
      // while autoscrolling.
      if (isAtBottom !== undefined) isAtBottom(bottom || !manuallyScrolled);

      // This is the internal status to determine if we are at bottom. We
      // report this without modifications because handleWheel depends on it.
      setAtBottom(bottom);
    };

    const handleWheel = () => {
      // Fired when we manually scroll with the mouse. Check if we are away
      // from the bottom; in that case we have manually scrolled away and don't
      // want to continue autoscrolling.
      if (atBottom) {
        setManuallyScrolled(false);
      } else {
        setManuallyScrolled(true);
      }
    };

    const handleMouseUp = (event: React.MouseEvent<'div'>) => {
      // Fired when the mouse button is released. We check if the position of
      // the click on the area where the scrollbar is. If so, we call
      // handleWheel because the logic is the same. For no the expected width
      // of the scrollbar is hardcoded but ths may require some tweaking for
      // different OS's or screen resolutions.
      const onScrollBar =
        event.clientX >= document.documentElement.offsetWidth - 25;
      if (onScrollBar) handleWheel();
    };

    const handleKeyDown = (event: React.KeyboardEvent<'div'>) => {
      // Fired when a key is pressed when focused on the log viewport. If
      // the key pressed is an arrow up or down, call the same logic as in
      // handleWheel.
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') handleWheel();
    };

    const triggerScroll = React.useCallback(
      (behavior: string = 'calculate') => {
        // Only scroll if we sticky or if we haven't manually scrolled away.
        // Avoid scrolling if we are already scrolling.
        if (!scrolling && (!manuallyScrolled || stick)) {
          const target = document.getElementById(
            virtuoso ? 'virtuoso' : 'messages-container'
          );
          if (!target) return;

          if (behavior === 'calculate') {
            const scrollHeight = target.scrollHeight - target.scrollTop;
            behavior = scrollHeight > 1000 ? 'auto' : 'smooth';
          }

          if (virtuoso) {
            virtuosoRef.current?.scrollToIndex({
              index: children.length - 1,
              align: 'end',
              behavior: behavior as 'auto' | 'smooth'
            });
          } else {
            document.getElementById('scrollAnchor')?.scrollIntoView({
              block: 'end',
              behavior: behavior as 'auto' | 'smooth'
            } as ScrollIntoViewOptions);
          }
        }
      },
      [manuallyScrolled, stick, virtuoso, children.length, scrolling]
    );

    // Try to autoscroll when the messages change. This works well but has the
    // problem that when the messages are loaded when the log window opens,
    // they are not scrolled to the bottom until the first new message appears.
    // I think this happens because during the first few renders it doesn't
    // receive messages. There is probably some way around it. Also, it
    // probably triggers unnecessary scrolls because messages usually arrive
    // in blocks.
    React.useEffect(() => triggerScroll('auto'), [triggerScroll]);

    // This triggers a scroll on a timer. It seems to work well, solves the
    // issue with the initial rendering of messages, and it may actually be
    // more efficient (especially during the night when many message arrive
    // each second and this ensures that only a few scrolls are triggered).
    // It may produce a bit more bounding during scrolling, but I'm not sure.
    // The scroll interval cannot be too short or it's impossible to manually
    // scroll away because a new autoscroll blocks you before you reach the
    // not-bottom area of the scroll. One needs to play a bit with the interval
    // and the height of the scroll at which point one is consider not at
    // bottom. Best results seem to happen when the interval is the same
    // as the rate of sending buffered messages.
    // React.useLayoutEffect(() => {
    //   let interval = setInterval(() => triggerScroll('smooth'), 250);
    //   return () => clearInterval(interval);
    // }, [triggerScroll]);

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
          isScrolling={(status) => setScrolling(status)}
          onScroll={handleScroll}
          onWheel={handleWheel}
          onMouseUp={handleMouseUp}
          onKeyDown={handleKeyDown}
          overscan={300}
        />
      );
    } else {
      return (
        <>
          <div
            id='messages-container'
            style={{
              height: '100%',
              position: 'relative',
              overflowY: stick ? 'hidden' : 'scroll'
            }}
            onScroll={handleScroll}
          >
            {children}
            <div id='scrollAnchor' />
          </div>
        </>
      );
    }
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
      <div
        css={css`
          flexGrow: 1,
          height: '80%',
          width: '100vw',
          padding: '2px 8px 4px'
        `}
        id='logBox'
      >
        <ViewPort
          virtuoso={virtuoso}
          stick={stick}
          isAtBottom={(bottom) => setAtBottom(bottom)}
          style={{ overflowY: stick ? 'hidden' : 'scroll' }}
          {...props}
        >
          {messages}
        </ViewPort>
        <div
          css={css`
    position: 'fixed',
    right: 15,
    bottom: 60,
    zIndex: 60000
  `}
          style={{ opacity: fbOpacity }}
        >
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
