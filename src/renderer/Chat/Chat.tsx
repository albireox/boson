/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-17
 *  @Filename: Chat.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline, Stack } from '@mui/material';
import { Keyword } from 'main/tron/types';
import React from 'react';
import { useEventListener, useKeywords, useStore } from 'renderer/hooks';
import Bubble from './Bubble';
import Header from './Header';
import './imessage.css';
import Input from './Input';

export interface MessageType {
  date: Date;
  user: string;
  message: string;
  first: boolean;
  last: boolean;
  mine: boolean;
}

export default function Chat() {
  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const [initialised, setInitialised] = React.useState(false);

  const lastMessageRef = React.useRef<MessageType>();
  const [notify] = useStore<boolean>('chat.notifications');

  const [, myUser] = window.electron.tron.getCredentials();

  const addMessage = React.useCallback(
    (key: Keyword) => {
      const [dateStr, message] = key.values;
      const user = (key.commander ?? '?').split('.').slice(-1)[0];

      const newMessage: MessageType = {
        date: new Date(dateStr),
        user,
        message,
        first: true,
        last: true,
        mine: user === myUser,
      };

      setMessages((current) => {
        if (lastMessageRef.current) {
          if (lastMessageRef.current.user === newMessage.user) {
            const previous = current.at(-1);
            if (previous) previous.last = false;
          }
          if (lastMessageRef.current.user === newMessage.user) {
            newMessage.first = false;
          }
        }
        lastMessageRef.current = newMessage;
        return [...current, newMessage];
      });

      window.electron.app
        .isFocused()
        .then((focused) => {
          if (!focused && notify) {
            const not = new Notification(user, {
              body: message,
              silent: true,
            });
            not.onclick = () => window.focus();
          }
          return true;
        })
        .catch(() => {});
    },
    [myUser, notify]
  );

  React.useEffect(() => {
    if (initialised) return;

    window.electron.tron
      .getAllKeywords('msg.msg')
      .then((keywords) => {
        keywords.forEach((key) => addMessage(key));
        return true;
      })
      .catch(() => {});

    setInitialised(true);
  }, [initialised, addMessage, myUser]);

  const handleMsg = React.useCallback(
    (name: string, keyword: Keyword) => {
      if (!initialised) return;
      if (name === 'msg.msg') addMessage(keyword);
    },
    [initialised, addMessage]
  );

  // Chat is special in that we don't want to get the last value of a keyword
  // but all the keywords. If we use the normal approach for msg.msg, every
  // time the window reloads (for example when the notifications are turned on
  // or off) the last message will be added again. With this we add a
  // subscription for msg.msg without generating an event for the last
  // keyword seen (which may be old) and manually handle the event.
  useKeywords(['msg.msg'], false);
  useEventListener('tron-keywords', handleMsg);

  return (
    <Box
      component='main'
      display='flex'
      position='absolute'
      width='100%'
      top={0}
    >
      <CssBaseline />
      <Stack direction='column' height='100%'>
        <Header />
        <Box
          component='div'
          className='imessage'
          width='100%'
          height='100%'
          flexDirection='column-reverse'
          display='flex'
          overflow='scroll'
        >
          {Array.from(messages)
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((message, index) => (
              <Bubble key={index} data={message} />
            ))}
        </Box>
        <Input />
      </Stack>
    </Box>
  );
}
