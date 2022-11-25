/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-11
 *  @Filename: Log.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline } from '@mui/material';
import { Stack } from '@mui/system';
import * as React from 'react';
import { HeaderDivider } from 'renderer/Components';

import CommandInput from './CommandInput';
import LogConfigContext, {
  ConfigIface,
  createLogConfig,
  defaultConfig,
} from './config';
import Header from './Header/Header';
import MessageViewport from './MessageViewport';

export interface LogProps {
  logId: number;
}

export default function Log(props: LogProps) {
  const { logId } = props;

  const [config, setConfig] = React.useState<ConfigIface>(defaultConfig);
  const logConfig = createLogConfig(config, setConfig);

  return (
    <Box
      component='main'
      sx={{
        display: 'flex',
        position: 'absolute',
        height: '100%',
      }}
      width='100%'
      position='absolute'
      top={0}
    >
      <CssBaseline />
      <LogConfigContext.Provider value={logConfig}>
        <Header logId={logId} />
        <HeaderDivider />
        <Stack
          height='100%'
          direction='column'
          px={2}
          pt={2}
          pb={2}
          spacing={2}
        >
          <MessageViewport />
          <CommandInput />
        </Stack>
      </LogConfigContext.Provider>
    </Box>
  );
}
