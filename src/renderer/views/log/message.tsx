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
import { MessageCode, Reply } from 'main/tron';
import React from 'react';
import { ConfigState } from './index';

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

export default Message;
