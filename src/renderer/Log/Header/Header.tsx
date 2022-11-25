/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-23
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack, Typography } from '@mui/material';
import ReplyCodeButton from './ReplyCodeButton';
import SearchBox from './SearchBox';

export interface HeaderProps {
  logId: number;
}

export default function Header(props: HeaderProps) {
  const { logId } = props;

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
        <div style={{ flexGrow: 1 }} />
        <ReplyCodeButton />
        <SearchBox />
      </Stack>
    </Box>
  );
}
