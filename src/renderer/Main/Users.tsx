/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-17
 *  @Filename: Users.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Avatar,
  Box,
  Card,
  Divider,
  Stack,
  Typography,
  TypographyProps,
} from '@mui/material';
import { ConnectionStatus } from 'main/tron/types';
import React from 'react';
import { useConnectionStatus, useKeywords } from 'renderer/hooks';
import { stringToColour } from 'renderer/tools';

interface UserInfoProps {
  data: string[];
  isMe?: boolean;
}

const SystemInfoTypo = (props: TypographyProps) => (
  <Typography variant='body1' color='text.secondary' {...props} />
);

const Separator = () => (
  <Divider orientation='vertical' variant='middle' flexItem />
);

function UserInfo(props: UserInfoProps) {
  const { data, isMe = false } = props;

  const userName = data[0].split('.')[1];
  const initial = userName[0].toUpperCase();

  return (
    <Card variant='outlined' sx={{ p: 2 }}>
      <Stack direction='row'>
        <Avatar
          sx={{
            bgcolor: stringToColour(userName),
          }}
        >
          {initial}
        </Avatar>
        <Stack direction='column' alignSelf='center' pl={2}>
          <Typography variant='subtitle1'>
            <b>
              {userName} {isMe ? '(me)' : ''}
            </b>
          </Typography>
          <Stack direction='row' spacing={1}>
            <SystemInfoTypo>{data[1]}</SystemInfoTypo>
            <Separator />
            <SystemInfoTypo>{data[2]}</SystemInfoTypo>
            <Separator />
            <SystemInfoTypo>{data[3]}</SystemInfoTypo>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function Users() {
  const [initialised, setInitialised] = React.useState(false);

  const keywords = useKeywords(['hub.users', 'hub.user']);

  const [myUser, setMyUser] = React.useState('');

  const [users, setUsers] = React.useState<string[]>([]);
  const [userInfo, setUserInfo] = React.useState<{ [k: string]: string[] }>({});

  const [connectionStatus] = useConnectionStatus();

  React.useEffect(() => {
    if (initialised && !(connectionStatus & ConnectionStatus.Ready))
      setInitialised(false);
  }, [connectionStatus, initialised]);

  React.useEffect(() => {
    if (initialised) return;

    const [, us] = window.electron.tron.getCredentials();
    setMyUser(us);

    window.electron.tron
      .getAllKeywords('hub.user')
      .then((keys) => {
        keys.forEach((key) => {
          const { values } = key;
          const userName: string = values[0].split('.')[1];
          setUserInfo((current) => ({ ...current, [userName]: values }));
        });
        return true;
      })
      .catch(() => {});

    setInitialised(true);
  }, [initialised]);

  React.useEffect(() => {
    const { 'hub.users': usersKw, 'hub.user': userKw } = keywords;

    if (userKw) {
      setUserInfo((current) => ({
        ...current,
        [userKw.values[0].split('.')[1]]: userKw.values,
      }));
    }

    if (usersKw) {
      setUsers(usersKw.values.map((name) => name.split('.')[1]));
    }
  }, [keywords]);

  const NoUsers = () => (
    <div
      style={{
        textShadow: '0px -1px 0px rgba(0,0,0,.5)',
        textAlign: 'center',
        position: 'relative',
        top: '40%',
        fontFamily: 'sans-serif',
        color: '#666',
        fontSize: '50px',
      }}
    >
      No users
    </div>
  );

  const UserList = () => {
    return (
      <Stack direction='column' spacing={1} pb={2}>
        {users.sort().map((user) => {
          if (userInfo[user]) {
            return (
              <UserInfo
                key={user}
                data={userInfo[user]}
                isMe={user === myUser}
              />
            );
          }
          return null;
        })}
      </Stack>
    );
  };

  return (
    <Box height='100%'>{users.length === 0 ? <NoUsers /> : <UserList />}</Box>
  );
}
