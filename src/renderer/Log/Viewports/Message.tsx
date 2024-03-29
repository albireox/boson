/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-23
 *  @Filename: Message.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { SxProps, Theme, Typography } from '@mui/material';
import Reply from 'main/tron/reply';
import { ReplyCode } from 'main/tron/types';
import React from 'react';
import Highlighter from 'react-highlight-words';

const MessageStyle: SxProps = {
  margin: 0,
  padding: 0,
  fontFamily: 'Source Code Pro',
  fontWeight: 500,
  paddingLeft: '2em',
  textIndent: '-2em',
  WebkitUserSelect: 'unset',
};

export interface MessageProps {
  reply: Reply;
  theme: Theme;
  style?: React.CSSProperties;
  searchText: string | null;
  searchUseRegEx: boolean;
  wrap: boolean;
  user?: string;
  highlightCommands?: string;
}

function getMessageColor(
  theme: Theme,
  reply: Reply,
  highlightCommands: boolean = true
) {
  const accent = 'main';

  const { code, sender } = reply;

  // We only want to colourize CmdDone if the reply code is Done.
  if (code === ReplyCode.Done && sender !== 'cmds') return undefined;

  switch (code) {
    case ReplyCode.Started:
      if (highlightCommands) return theme.palette.info.main;
      return undefined;
    case ReplyCode.Error:
      return theme.palette.error[accent];
    case ReplyCode.Failed:
      return theme.palette.error[accent];
    case ReplyCode.Warning:
      return theme.palette.warning[accent];
    case ReplyCode.Debug:
      return theme.palette.text.disabled;
    case ReplyCode.Done:
      if (highlightCommands) return theme.palette.success[accent];
      return undefined;
    default:
      return undefined;
  }
}

function formatDate(date: number) {
  return new Date(date).toUTCString().split(' ')[4];
}

const CmdQueuedRegex =
  /CmdQueued=([0-9]+),([0-9.]+),"(.+?)",([0-9]+),"(.+?)",([0-9]+),"(.+?)"/;

const CmdDoneRegex = /CmdDone=([0-9]+),"[:f]",([0-9]+),"(.+)","(.+?)","(.+?)"/;

export default function Message(props: MessageProps) {
  const {
    reply,
    style,
    theme,
    searchText = null,
    searchUseRegEx = false,
    wrap = false,
  } = props;

  const getMessageColorMemo = React.useCallback(() => {
    // Decide whether to colourise the CmdQueued/CmdDone lines.
    // If we only want to highlight the commands for the user, check
    // if the raw line contains the user, since CmdQueued/CmdDone are
    // emitted by the hub and have commander .hub.
    // This does not affect the colourisation of other messages.

    const { user = '', highlightCommands = 'mine' } = props;

    let highlight = false;
    if (
      highlightCommands === 'all' ||
      (highlightCommands === 'mine' &&
        user &&
        reply.rawLine.toLowerCase().includes(user))
    ) {
      highlight = true;
    }

    return getMessageColor(theme, reply, highlight);
  }, [theme, reply, props]);

  if (reply === undefined) return null;

  let text: string = reply.rawLine;
  const color = getMessageColorMemo();

  // CmdQueued and CmdDone have some special handling. We parse them
  // and rearrange some of the text.
  if (reply.sender === 'cmds') {
    const matchS = reply.rawLine.match(CmdQueuedRegex);
    if (matchS) {
      text = `${matchS[3]} CmdStarted ${matchS[4]} ${matchS[5]} ${matchS[7]}`;
    }
    const matchD = reply.rawLine.match(CmdDoneRegex);
    if (matchD) {
      text = `${matchD[3]} CmdDone ${matchD[2]} ${matchD[4]} ${matchD[5]}`;
    }
  }

  const fullText = `${formatDate(reply.date)} ${text}`;

  let highlighted: React.ReactElement = <span>{fullText}</span>;

  if (searchText) {
    highlighted = (
      <Highlighter
        searchWords={[searchText]}
        autoEscape={!searchUseRegEx}
        textToHighlight={fullText}
      />
    );
  }

  return (
    <Typography
      sx={{
        ...MessageStyle,
        ...{ color },
        ...{ whiteSpace: wrap ? 'normal' : 'nowrap' },
      }}
      style={style}
    >
      {highlighted}
    </Typography>
  );
}
