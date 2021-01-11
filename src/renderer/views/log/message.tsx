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

const Messages = () => {
  const classes = useStyles();
  const [messages, setMessages] = React.useState<MessageReturnType[]>([]);
  const [replies, setReplies] = React.useState<Reply[]>([]);
  const config = React.useContext(ConfigContext);
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);
  const getMessageMemo = React.useCallback(
    (reply: Reply) => getMessage(reply, config),
    [config]
  );

  const parseReply = (newReplies?: Reply | Reply[]) => {
    if (newReplies !== undefined) {
      if (!Array.isArray(newReplies)) newReplies = [newReplies];

      setReplies((prevReplies) => [
        ...prevReplies,
        ...(newReplies as Reply[])
      ]);
      let newMessages = newReplies
        .map((r) => getMessageMemo(r))
        .filter((x) => x !== null);

      setMessages((prevMessages: MessageReturnType[]) => [
        ...prevMessages,
        ...newMessages
      ]);
    } else {
      setMessages(
        replies.map((r) => getMessageMemo(r)).filter((x) => x !== null)
      );
    }
  };
  useListener(parseReply);

  React.useEffect(() => {
    // Call parseReply without arguments forces a full re-render.
    parseReply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  React.useEffect(() => {
    if (virtuosoRef && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: messages.length - 1,
        align: 'end',
        behavior: 'auto'
      });
    }
  }, [messages]);

  return (
    <div className={classes.logBox}>
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        itemContent={(index, message) => message}
      />
    </div>
  );
};

export default Messages;
