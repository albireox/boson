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
import { MessageCode, Reply } from 'main/tron';
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

function formatDate(date: Date) {
  return date.toUTCString().split(' ')[4];
}

function getMessageColour(theme: Theme, code: MessageCode) {
  let accent = theme.palette.type || 'main';

  switch (code) {
    case MessageCode.Error:
      return theme.palette.error[accent];
    case MessageCode.Failed:
      return theme.palette.error[accent];
    case MessageCode.Warning:
      return theme.palette.warning[accent];
    case MessageCode.Debug:
      return theme.palette.text.disabled;
    default:
      return undefined;
  }
}

function isVisible(code: MessageCode, config: ConfigState) {
  let levels = config.levels;
  if (!levels) return true;

  switch (code) {
    case MessageCode.Info:
      if (levels.includes('info')) return true;
      break;
    case MessageCode.Debug:
      if (levels.includes('debug')) return true;
      break;
    case MessageCode.Warning:
      if (levels.includes('warning')) return true;
      break;
    case MessageCode.Error:
      if (levels.includes('error')) return true;
      break;
    case MessageCode.Failed:
      if (levels.includes('error')) return true;
      break;
    default:
      if (levels.includes('debug')) return true;
      break;
  }
  return false;
}

export function getMessage(reply: Reply, config: ConfigState) {
  if (!isVisible(reply.code, config)) return null;
  return <Message reply={reply} key={reply.id} />;
}

type MessageProps = TypographyProps & { reply: Reply };

const Message: React.FC<MessageProps> = ({ reply, ...props }) => {
  const theme = useTheme();

  let messageColour = getMessageColour(theme as Theme, reply.code);

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
type MessagesProps = { onConfigUpdate: (newConfig: ConfigState) => void };

const Messages: React.FC<MessagesProps> = ({ onConfigUpdate }) => {
  const classes = useStyles();

  const [messages, setMessages] = React.useState<MessageReturnType[]>([]);
  const [replies, setReplies] = React.useState<Reply[]>([]);
  const [atBottom, setAtBottom] = React.useState(true);
  const [autoScroll, setAutoScroll] = React.useState(true);

  const config = React.useContext(ConfigContext);

  const virtuosoRef = React.useRef<VirtuosoHandle>(null);

  const getMessageMemo = React.useCallback(
    (reply: Reply) => getMessage(reply, config),
    [config]
  );

  const filterReplies = (replies: Reply[]) =>
    replies
      .filter(
        (x) =>
          config.selectedActors?.length === 0 ||
          config.selectedActors?.includes(x.sender)
      )
      .map((r) => getMessageMemo(r))
      .filter((x) => x !== null);

  const parseReply = (newReplies?: Reply | Reply[]) => {
    if (newReplies !== undefined) {
      if (!Array.isArray(newReplies)) newReplies = [newReplies];

      setReplies((prevReplies) => [
        ...prevReplies,
        ...(newReplies as Reply[])
      ]);

      newReplies.forEach((reply) => {
        if (config.seenActors && !config.seenActors.includes(reply.sender)) {
          onConfigUpdate({
            seenActors: [...config.seenActors, reply.sender].sort()
          });
        }
      });

      let newMessages = filterReplies(newReplies);

      setMessages((prevMessages: MessageReturnType[]) => [
        ...prevMessages.slice(-config.nMessages!),
        ...newMessages
      ]);
    } else {
      setMessages(filterReplies(replies).slice(-config.nMessages!));
    }
  };

  useListener(parseReply);

  // Called when the div scrolls. It is also called when we do an automatic
  // scroll to bottom. If the scroll was automatic, autoScroll = true, in that
  // case we just set it to false. If it's false, we check the scroll position
  // compared with the bottom of the div and if the difference is < 50 (to
  // give it some margin in case of bounce), we say we are at the bottom.
  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (!autoScroll) {
      const currentTarget = event.currentTarget;
      const scrollHeight =
        currentTarget.scrollHeight - currentTarget.scrollTop;
      const bottom = scrollHeight - currentTarget.clientHeight < 50;
      setAtBottom(bottom);
    } else {
      setAutoScroll(false);
    }
  };

  React.useEffect(() => {
    // Call parseReply without arguments forces a full re-render.
    parseReply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  React.useEffect(() => {
    // Manually force scroll to bottom, only if we are already at bottom.
    if (atBottom) {
      // Indicate the following scroll was not done by the user.
      setAutoScroll(true);
      if (virtuosoRef && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({
          index: messages.length - 1,
          align: 'end',
          behavior: 'auto'
        });
      }
    }
  }, [messages, atBottom]);

  return (
    <div className={classes.logBox}>
      <Virtuoso
        onScroll={handleScroll}
        ref={virtuosoRef}
        data={messages}
        itemContent={(index, message) => message}
      />
    </div>
  );
};

export default Messages;
