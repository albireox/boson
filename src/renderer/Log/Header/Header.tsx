/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-23
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Divider, Stack, Typography } from '@mui/material';
import { useLogConfig } from '../hooks';
import ActorButton from './ActorButton';
import LogSearchBox from './LogSearchBox';
import ReplyCodeButton from './ReplyCodeButton';

interface ActorInfoProps {
  actors: Set<string>;
}

function ActorInfo(props: ActorInfoProps) {
  const { actors } = props;

  if (actors.size === 0) return null;

  return (
    <>
      <Divider orientation='vertical' variant='middle' sx={{ height: '60%' }} />
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{
          maxWidth: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {Array.from(actors).join(', ')}
      </Typography>
    </>
  );
}

export interface HeaderProps {
  logId: number;
}

export default function Header(props: HeaderProps) {
  const { logId } = props;

  const { config } = useLogConfig();
  const { actors } = config;

  return (
    <Box height='50px' pl={8}>
      <Stack
        direction='row'
        alignItems='center'
        height='100%'
        spacing={2}
        px={2}
      >
        <div>
          <Typography
            component='span'
            variant='h6'
            fontFamily='Source Code Pro'
          >
            log
          </Typography>
          <Typography
            component='span'
            variant='h6'
            color='text.secondary'
            fontFamily='Source Code Pro'
            pl={0.5}
          >
            #{logId}
          </Typography>
        </div>
        <ActorInfo actors={actors} />
        <div style={{ flexGrow: 1 }} />
        <ActorButton />
        <ReplyCodeButton />
        <LogSearchBox />
      </Stack>
    </Box>
  );
}
