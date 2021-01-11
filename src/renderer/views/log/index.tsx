/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { makeStyles } from '@material-ui/core';
import { Reply } from 'main/tron';
import React, { Fragment } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useListener } from 'renderer/hooks';
import CommandInput from './input';
import MenuBar from './menubar';
import { getMessage } from './message';

const useStyles = makeStyles((theme) => ({
  menubar: {
    padding: '2px 8px 8px'
  },
  logBox: {
    flexGrow: 1,
    height: '80%',
    width: '100vw',
    overflowY: 'scroll',
    padding: '2px 8px 4px'
  }
}));

export interface ConfigState {
  levels?: string[];
}

export const ConfigContext = React.createContext<ConfigState>({});

export function LogView() {
  const classes = useStyles();

  const virtuosoRef = React.useRef<VirtuosoHandle>(null);

  const [messages, setMessages] = React.useState<any[]>([]);
  const [config, setConfig] = React.useState<ConfigState>({});
  const [replies, setReplies] = React.useState<Reply[]>([]);

  const parseReply = (newReplies?: Reply | Reply[]) => {
    if (newReplies !== undefined) {
      if (!Array.isArray(newReplies)) newReplies = [newReplies];
      setReplies((prevReplies) => [
        ...prevReplies,
        ...(newReplies as Reply[])
      ]);
      let newMessages = newReplies
        .map((r) => getMessage(r, config))
        .filter((x) => x !== null);
      setMessages((prevMessages: any) => [...prevMessages, ...newMessages]);
    } else {
      setMessages(
        replies.map((r) => getMessage(r, config)).filter((x) => x !== null)
      );
    }
  };
  useListener(parseReply);

  React.useEffect(() => {
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
    <Fragment>
      <MenuBar
        className={classes.menubar}
        onConfigUpdate={(newConfig) => {
          setConfig({ ...config, ...newConfig });
        }}
      />
      <ConfigContext.Provider value={config}>
        <div className={classes.logBox}>
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            initialTopMostItemIndex={999}
            itemContent={(index, message) => message}
          />
        </div>
      </ConfigContext.Provider>
      <CommandInput />
    </Fragment>
  );
}

export default LogView;
