/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-17
 *  @Filename: Bubble.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Avatar, Box, Stack, Tooltip, Typography } from '@mui/material';
import { stringToColour } from 'renderer/tools';
import { MessageType } from './Chat';

interface TextAvatarProps {
  user: string;
  mine: boolean;
}

function TextAvatar(props: TextAvatarProps) {
  const { user, mine } = props;
  return (
    <Tooltip title={user}>
      <Avatar
        sx={{
          bgcolor: stringToColour(user),
          width: 25,
          height: 25,
          transform: mine ? 'translate(1px, -1px)' : 'translate(-1px, -1px)',
          alignSelf: 'end',
          zIndex: 10,
        }}
      >
        {user[0].toUpperCase()}
      </Avatar>
    </Tooltip>
  );
}

function ThisAvatar(props: { user: string; mine: boolean }) {
  const { user, mine } = props;
  return <TextAvatar user={user} mine={mine} />;
}

function UserLabel(props: { first: boolean; user: string }) {
  const { user, first } = props;
  return (
    <Box display={first ? 'block' : 'none'}>
      <Typography variant='body2' style={{ paddingBottom: 0 }}>
        {user}
      </Typography>
    </Box>
  );
}

interface BubbleProps {
  data: MessageType;
}

export default function Bubble(props: BubbleProps) {
  const { data } = props;
  const {
    date,
    user,
    message,
    first = false,
    last = false,
    mine = false,
  } = data;

  let classes = '';
  if (mine) {
    classes += 'from-me';
  } else {
    classes += 'from-them';
  }
  if (!last) {
    classes += ' no-tail';
  }

  if (!message) return null;

  return (
    <Stack
      direction='row'
      width='100%'
      spacing={0.75}
      marginBottom={last ? '5px' : undefined}
    >
      {!mine && last ? (
        <ThisAvatar user={user} mine={mine} />
      ) : (
        <Box width={25} />
      )}
      <Box flexGrow={1} sx={{ textAlign: mine ? '-webkit-right' : 'left' }}>
        <Stack direction='column'>
          <UserLabel user={user} first={first} />
          <Tooltip title={date.toUTCString()}>
            <Box
              component='p'
              className={classes}
              sx={(theme) => ({
                '&.from-them::after': {
                  backgroundColor: theme.palette.background.default,
                },
                '&.from-me::after': {
                  backgroundColor: theme.palette.background.default,
                },
              })}
            >
              {message}
            </Box>
          </Tooltip>
        </Stack>
      </Box>
      {mine && last ? (
        <ThisAvatar user={user} mine={mine} />
      ) : (
        <Box width={25} />
      )}
    </Stack>
  );
}
