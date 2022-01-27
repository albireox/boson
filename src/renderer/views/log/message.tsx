/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: message.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Theme, Typography, TypographyProps, useTheme } from '@mui/material';
import { Reply, ReplyCode } from 'main/tron';
import * as React from 'react';
import Highlighter, { HighlighterProps } from 'react-highlight-words';
import FollowScroll, { FollowScrollHandle } from 'renderer/components/followScroll';
import { useKeywords, useListener } from 'renderer/hooks';
import { ConfigContext, ConfigState, SearchContext, SearchState } from './index';

const classes = {
  messages: {
    margin: 0,
    padding: 0,
    fontFamily: 'Source Code Pro',
    fontWeight: 400
    // whiteSpace: 'pre-wrap'
  }
} as const;

function formatDate(date: string) {
  return date.split(' ')[4];
}

function getMessageColour(theme: Theme, code: ReplyCode) {
  let accent = theme.palette.mode || 'main';

  switch (code) {
    case ReplyCode.Error:
      return theme.palette.error[accent];
    case ReplyCode.Failed:
      return theme.palette.error[accent];
    case ReplyCode.Warning:
      return theme.palette.warning[accent];
    case ReplyCode.Debug:
      return theme.palette.text.disabled;
    case ReplyCode.Done:
      return theme.palette.success[accent];
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

function getHighlighterProps(
  message: string,
  search: SearchState
): Partial<HighlighterProps> | null {
  const highlighterProps: Partial<HighlighterProps> = { searchWords: [] };

  if (search.searchExpr !== '') {
    if (search.limit) {
      let regExp = RegExp(
        search.regExp ? search.searchExpr : escapeRegExp(search.searchExpr),
        'i'
      );
      if (!message.match(regExp)) return null;
    }
    highlighterProps.searchWords = [search.searchExpr];
    highlighterProps.autoEscape = !search.regExp;
  }

  return highlighterProps;
}

const CmdQueuedRegex = new RegExp(
  'CmdQueued=([0-9]+),([0-9.]+),"(.+?)",([0-9]+),"(.+?)",([0-9]+),"(.+?)"'
);

export function getMessage(
  reply: Reply,
  config: ConfigState,
  search: SearchState
): JSX.Element | null {
  // If the message contains CmdQueue this is a new command (possibly from the log window input)
  // and we want to echo it in a different colour.
  let cmd_queued_jsx: JSX.Element | null = null;
  let message_jsx: JSX.Element | null = null;

  if (
    reply.sender === 'cmds' &&
    !reply.rawLine.includes('CmdQueued') &&
    config.selectedActors.length > 0 &&
    !config.selectedActors.includes('hub')
  ) {
    return null;
  }

  if (reply.rawLine.includes('CmdQueued')) {
    let match = reply.rawLine.match(CmdQueuedRegex);
    if (match) {
      const to_actor = match[5];
      if (config.selectedActors.length > 0 && !config.selectedActors.includes(to_actor)) {
        return null;
      }
      const queued_string =
        formatDate(reply.date) + ' ' + match[3] + ' ' + match[4] + ' ' + match[5] + ' ' + match[7];
      const highlighterProps = getHighlighterProps(queued_string, search);
      if (highlighterProps !== null) {
        cmd_queued_jsx = (
          <Typography
            sx={{ ...classes.messages, ...{ color: 'info.main' } }}
            key={'CmdQueued' + reply.id.toString()}
          >
            <Highlighter
              {...(highlighterProps as HighlighterProps)}
              textToHighlight={queued_string}
            />
          </Typography>
        );
      }
    }
  }

  const visible = isVisible(reply.code, config.levels);
  if (visible || cmd_queued_jsx !== null) {
    const message = formatDate(reply.date) + ' ' + reply.rawLine;
    const highlighterProps = getHighlighterProps(message, search);
    if (highlighterProps === null) {
      return cmd_queued_jsx;
    } else {
      if (visible) {
        message_jsx = <Message reply={reply} key={reply.id} HighlighterProps={highlighterProps} />;
      }
      return (
        <>
          {message_jsx}
          {cmd_queued_jsx}
        </>
      );
    }
  }
  return null;
}

type MessageProps = TypographyProps & {
  reply: Reply;
  HighlighterProps: Partial<HighlighterProps>;
};

const Message: React.FC<MessageProps> = ({ reply, HighlighterProps, ...props }) => {
  const theme: Theme = useTheme();

  const getMessageColourMemo = React.useCallback(
    (code) => getMessageColour(theme as Theme, code),
    [theme]
  );

  let messageColour = getMessageColourMemo(reply.code);
  let data: string | JSX.Element = formatDate(reply.date) + ' ' + reply.rawLine;

  if (HighlighterProps.searchWords) {
    data = <Highlighter {...(HighlighterProps as HighlighterProps)} textToHighlight={data} />;
  }

  return (
    <Typography sx={classes.messages} style={{ color: messageColour }} {...props}>
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
        config.selectedActors.includes(x.sender) ||
        x.sender === 'cmds'
    )
    .slice(-keepMessages)
    .map((r) => getMessage(r, config, search))
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
      messages: [...state.messages, ...filterReplies(action.data!, action.config!, action.search!)]
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
  const [buffer, setBuffer] = React.useState<Reply[]>([]);

  const config = React.useContext(ConfigContext);
  const search = React.useContext(SearchContext);

  const actors = useKeywords(['hub.actors'], 'log-hub-actors');

  const ref = React.useRef<FollowScrollHandle>(null);

  React.useEffect(() => {
    if (actors['hub.actors'] !== undefined && actors['hub.actors'].values.length > 0) {
      onConfigUpdate({
        seenActors: actors['hub.actors'].values
      });
    }
  }, [actors, onConfigUpdate]);

  React.useEffect(() => {
    window.api.on('clear-logs', () => dispatch({ type: 'clear' }));
  }, []);

  React.useEffect(() => {
    dispatch({ type: 'refresh', config: config, search: search });
  }, [config, search]);

  React.useEffect(() => {
    let timer = setInterval(() => {
      dispatch({
        type: 'append',
        data: buffer,
        config: config,
        search: search
      });
      setBuffer([]);
    }, 100);
    return () => clearInterval(timer);
  }, [buffer, config, search, dispatch]);

  useListener((replies: Reply[]) => setBuffer((prev) => [...prev, ...replies]));

  return <FollowScroll virtuoso ref={ref} messages={state.messages} wrap={config.wrap} />;
};

export default Messages;
