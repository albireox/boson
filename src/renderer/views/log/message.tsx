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
import Highlighter, { HighlighterProps } from 'react-highlight-words';
import FollowScroll, {
  FollowScrollHandle
} from 'renderer/components/followScroll';
import { useListener } from 'renderer/hooks';
import {
  ConfigContext,
  ConfigState,
  SearchContext,
  SearchState
} from './index';

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

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isVisible(code: ReplyCode, levels: ReplyCode[]) {
  if (levels.includes(code)) return true;
  return false;
}

export function getMessage(
  reply: Reply,
  levels: ReplyCode[],
  search: SearchState
) {
  if (!isVisible(reply.code, levels)) return null;

  const highlighterProps: Partial<HighlighterProps> = { searchWords: [] };

  if (search.searchExpr !== '') {
    if (search.limit) {
      let message = formatDate(reply.date) + ' ' + reply.rawLine;
      let regExp = RegExp(
        search.regExp ? search.searchExpr : escapeRegExp(search.searchExpr),
        'i'
      );
      if (!message.match(regExp)) return null;
    }
    highlighterProps.searchWords = [search.searchExpr];
    highlighterProps.autoEscape = !search.regExp;
  }

  return (
    <Message
      reply={reply}
      key={reply.id}
      HighlighterProps={highlighterProps}
    />
  );
}

type MessageProps = TypographyProps & {
  reply: Reply;
  HighlighterProps: Partial<HighlighterProps>;
};

const Message: React.FC<MessageProps> = ({
  reply,
  HighlighterProps,
  ...props
}) => {
  const theme: Theme = useTheme();

  const getMessageColourMemo = React.useCallback(
    (code) => getMessageColour(theme as Theme, code),
    [theme]
  );

  let messageColour = getMessageColourMemo(reply.code);
  let data: string | JSX.Element =
    formatDate(reply.date) + ' ' + reply.rawLine;

  if (HighlighterProps.searchWords) {
    data = (
      <Highlighter
        {...(HighlighterProps as HighlighterProps)}
        textToHighlight={data}
      />
    );
  }

  return (
    <Typography
      style={{
        color: messageColour,
        margin: 0,
        padding: 0
      }}
      {...props}
    >
      {data}
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
  search: SearchState,
  keepMessages = 0
) =>
  replies
    .filter(
      (x) =>
        config.selectedActors.length === 0 ||
        config.selectedActors.includes(x.sender)
    )
    .slice(-keepMessages)
    .map((r) => getMessage(r, config.levels, search))
    .filter((x) => x !== null);

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
  action: {
    type: string;
    config?: ConfigState;
    search?: SearchState;
    data?: Reply[];
  }
) => {
  if (action.type === 'append') {
    return {
      replies: [...state.replies, ...action.data!],
      messages: [
        ...state.messages,
        ...filterReplies(action.data!, action.config!, action.search!)
      ]
    };
  } else if (action.type === 'refresh') {
    return {
      messages: filterReplies(state.replies, action.config!, action.search!),
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
  const search = React.useContext(SearchContext);

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
    dispatch({ type: 'refresh', config: config, search: search });
  }, [config, search]);

  const parse = React.useCallback(
    (replies: Reply[]) => {
      dispatch({
        type: 'append',
        data: replies,
        config: config,
        search: search
      });
      updateSeenActors(replies);
    },
    [config, search, dispatch, updateSeenActors]
  );

  return <FollowScroll virtuoso ref={ref} messages={state.messages} />;
};

export default Messages;
