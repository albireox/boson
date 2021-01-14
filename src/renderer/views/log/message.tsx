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

type MessagesProps = {
  onConfigUpdate: (newConfig: Partial<ConfigState>) => void;
};

const Messages: React.FC<MessagesProps> = ({ onConfigUpdate }) => {
  const [replies, setReplies] = React.useState<Reply[]>([]);

  const config = React.useContext(ConfigContext);

  const ref = React.useRef<FollowScrollHandle>(null);

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
      setReplies((prevReplies) => [...prevReplies, ...newReplies]);
      let nMessages = config.nMessages;
      let newMessages = filterReplies(newReplies, nMessages);
      ref.current?.update(newMessages);
      updateSeenActors(newReplies);
    } else {
      ref.current?.reset(filterReplies(replies, config.nMessages));
      updateSeenActors(replies.slice(-config.nMessages));
    }
  };

  useListener(parseReply);

  React.useEffect(() => {
    parseReply(); // Call parseReply without arguments forces a full re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.levels, config.selectedActors, config.nMessages]);

  return <FollowScroll virtuoso maxCount={config.nMessages} ref={ref} />;
};

export default Messages;
