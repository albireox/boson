/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: message.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  makeStyles,
  Theme,
  Typography,
  TypographyProps
} from '@material-ui/core';
import { useTheme } from '@material-ui/styles';
import { Reply, ReplyCode } from 'main/tron';
import React from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useListener } from 'renderer/hooks';
import { ConfigContext, ConfigState } from './index';

const useStyles = makeStyles((theme) => ({
  logBox: {
    flexGrow: 1,
    height: '80%',
    width: '100vw',
    overflowY: 'scroll',
    padding: '2px 8px 4px'
  }
}));

function formatDate(date: string) {
  return date.split(' ')[4];
}

function getMessageColour(theme: Theme, code: ReplyCode) {
  let accent = theme.palette.type || 'main';

  switch (code) {
    case ReplyCode.Error:
      return theme.palette.error[accent];
    case ReplyCode.Failed:
      return theme.palette.error[accent];
    case ReplyCode.Warning:
      return theme.palette.warning[accent];
    case ReplyCode.Debug:
      return theme.palette.text.disabled;
    default:
      return undefined;
  }
}

function isVisible(code: ReplyCode, levels: ReplyCode[]) {
  if (levels.includes(code)) return true;
  return false;
}

export function getMessage(reply: Reply, levels: ReplyCode[]) {
  if (!isVisible(reply.code, levels)) return null;
  return <Message reply={reply} key={reply.id} />;
}

type MessageProps = TypographyProps & { reply: Reply };

const Message: React.FC<MessageProps> = ({ reply, ...props }) => {
  const theme: Theme = useTheme();

  const getMessageColourMemo = React.useCallback(
    (code) => getMessageColour(theme as Theme, code),
    [theme]
  );

  let messageColour = getMessageColourMemo(reply.code);

  return (
    <Typography
      style={{
        color: messageColour,
        overflow: 'auto'
      }}
      {...props}
    >
      {formatDate(reply.date) + ' ' + reply.rawLine}
    </Typography>
  );
};

type MessageReturnType = ReturnType<typeof Message>;
type MessagesProps = {
  onConfigUpdate: (newConfig: Partial<ConfigState>) => void;
};

const Messages: React.FC<MessagesProps> = ({ onConfigUpdate }) => {
  const USE_VIRTUOSO = false;

  const classes = useStyles();

  const [messages, setMessages] = React.useState<MessageReturnType[]>([]);
  const [replies, setReplies] = React.useState<Reply[]>([]);
  const [firstRender, setFirstRender] = React.useState(true);

  const [atBottom, setAtBottom] = React.useState(true);
  const [autoScroll, setAutoScroll] = React.useState(true);

  const virtuosoRef = React.useRef<VirtuosoHandle>(null);

  let scrollTimer: any = null;

  const config = React.useContext(ConfigContext);

  const getMessageMemo = React.useCallback(
    (reply: Reply) => getMessage(reply, config.levels),
    [config.levels]
  );

  const updateSeenActors = async (replies: Reply[]) => {
    let actors = new Set(replies.map((r) => r.sender));
    let newSeenActors: string[] = [];
    actors.forEach((a) => {
      if (!config.seenActors.includes(a)) newSeenActors.push(a);
    });
    if (newSeenActors.length > 0) {
      onConfigUpdate({ seenActors: [...config.seenActors, ...newSeenActors] });
    }
  };

  const filterReplies = (replies: Reply[], keepMessages = 0) =>
    replies
      .filter(
        (x) =>
          config.selectedActors.length === 0 ||
          config.selectedActors.includes(x.sender)
      )
      .slice(-keepMessages)
      .map((r) => getMessageMemo(r))
      .filter((x) => x !== null);

  const parseReply = (newReplies?: Reply[]) => {
    if (newReplies !== undefined) {
      // if (newReplies.length < 10000) return;
      setReplies((prevReplies) => [...prevReplies, ...newReplies]);

      // If we are not at bottom, do not add messages to the window. This
      // prevents the feed scrolling up when we actually want it to be static.
      // Once we are back at bottom, we'll refresh all the messages.
      if (!atBottom) return;

      let nMessages = config.nMessages;
      let joinedMessages: any[];

      if (nMessages > 0 && newReplies.length >= nMessages) {
        let newMessages = filterReplies(newReplies, nMessages);
        joinedMessages = newMessages;
      } else {
        let newMessages = filterReplies(newReplies);
        let sliceN =
          messages.length + newMessages.length < nMessages
            ? 0
            : messages.length - newMessages.length;
        joinedMessages = [...messages.slice(-sliceN), ...newMessages];
      }

      setMessages(joinedMessages);
      updateSeenActors(newReplies);
    } else {
      setMessages(filterReplies(replies, config.nMessages));
      updateSeenActors(replies.slice(-config.nMessages));
    }
    scrollToBottom();
  };

  useListener(parseReply);

  // Called when the div scrolls. It is also called when we do an automatic
  // scroll to bottom. If the scroll was automatic, autoScroll = true, in that
  // case we just set it to false. If it's false, we check the scroll position
  // compared with the bottom of the div and if the difference is < 50 (to
  // give it some margin in case of bounce), we say we are at the bottom.
  // We do this with a delay so that we don't do this check while we are
  // actually scrolling. See https://bit.ly/3nICFBE.
  const handleScroll = (): any => {
    if (scrollTimer !== null) {
      clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(() => {
      if (!autoScroll) {
        // At this point event is not really current, so we manually get the
        // element to check.
        const currentTarget = USE_VIRTUOSO
          ? document.getElementById('virtuoso')
          : document.getElementById('logBox');
        if (currentTarget) {
          const scrollHeight =
            currentTarget.scrollHeight - currentTarget.scrollTop;
          const bottom = scrollHeight - currentTarget.clientHeight < 50;

          // If we are at the bottom, refresh all the messages since we
          // haven't been updating them while scrolled up.
          if (bottom) parseReply();
          setAtBottom(bottom);
        }
      } else {
        setAutoScroll(false);
      }
    }, 15);
  };

  React.useEffect(() => {
    parseReply(); // Call parseReply without arguments forces a full re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.levels, config.selectedActors, config.nMessages]);

  const scrollToBottom = () => {
    // Manually force scroll to bottom, only if we are already at bottom.
    if (atBottom || firstRender) {
      // Indicate the following scroll was not done by the user.
      setAutoScroll(true);
      if (!USE_VIRTUOSO) {
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
      if (firstRender) setFirstRender(false);
    }
  };

  const getMessageViewer = () => {
    if (USE_VIRTUOSO) {
      return (
        <Virtuoso
          id='virtuoso'
          onScroll={handleScroll}
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
      onScroll={USE_VIRTUOSO ? undefined : handleScroll}
    >
      {getMessageViewer()}
    </div>
  );
};

export default Messages;
