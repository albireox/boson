/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: message.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Theme, Typography, TypographyProps } from '@material-ui/core';
import { useTheme } from '@material-ui/styles';
import { Reply, ReplyCode } from 'main/tron';
import React from 'react';
import FollowScroll, {
  FollowScrollHandle
} from 'renderer/components/followScroll';
import { useListener } from 'renderer/hooks';
import { ConfigContext, ConfigState } from './index';

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

const filterReplies = (
  replies: Reply[],
  config: ConfigState,
  keepMessages = 0
) => {
  return replies
    .filter(
      (x) =>
        config.selectedActors.length === 0 ||
        config.selectedActors.includes(x.sender)
    )
    .slice(-keepMessages)
    .map((r) => getMessage(r, config.levels))
    .filter((x) => x !== null);
};

interface ReducerState {
  replies: Reply[];
  messages: MessageReturnType[];
}

const initialState: ReducerState = {
  replies: [] as Reply[],
  messages: [] as MessageReturnType[]
};

const reducer = (
  state: ReducerState,
  action: { type: string; config?: ConfigState; data?: Reply[] }
) => {
  if (action.type === 'append') {
    return {
      replies: [...state.replies, ...action.data!],
      messages: [
        ...state.messages,
        ...filterReplies(action.data!, action.config!)
      ]
    };
  } else if (action.type === 'refresh') {
    return {
      messages: filterReplies(state.replies, action.config!),
      replies: state.replies
    };
  } else if (action.type === 'clear') {
    return initialState;
  }
  return { messages: state.messages, replies: state.replies };
};

const Messages: React.FC<MessagesProps> = ({ onConfigUpdate }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const config = React.useContext(ConfigContext);
  const ref = React.useRef<FollowScrollHandle>(null);

  const updateSeenActors = React.useCallback(
    (replies: Reply[]) => {
      let actors = new Set(replies.map((r) => r.sender));
      let newSeenActors: string[] = [];
      actors.forEach((a) => {
        if (!config.seenActors.includes(a) && !a.startsWith('keys_'))
          newSeenActors.push(a);
      });
      if (newSeenActors.length > 0) {
        onConfigUpdate({
          seenActors: [...config.seenActors, ...newSeenActors]
        });
      }
    },
    [config.seenActors, onConfigUpdate]
  );

  React.useEffect(() => {
    // Not in use for now, but this allows to clear all the logs from the
    // menu or main.
    window.api.on('clear-logs', () => dispatch({ type: 'clear' }));
  }, []);

  React.useEffect(() => {
    dispatch({ type: 'refresh', config: config });
  }, [config]);

  useListener((replies: Reply[]) => {
    dispatch({ type: 'append', data: replies, config: config });
    updateSeenActors(replies);
  });

  return <FollowScroll virtuoso ref={ref} messages={state.messages} sticky />;
};

export default Messages;
