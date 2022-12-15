/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-11
 *  @Filename: Log.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline } from '@mui/material';
import { Stack } from '@mui/system';
import * as React from 'react';
import { useStore } from 'renderer/hooks';
import { ViewportRefType } from '.';

import CommandInput from './CommandInput';
import LogConfigContext, {
  ConfigIface,
  createLogConfig,
  defaultLogConfig,
} from './Context';
import LogHeader from './Header/LogHeader';
import MessageViewport from './MessageViewport';

export interface LogProps {
  logId: number;
}

export default function Log(props: LogProps) {
  const { logId } = props;

  const [wrap] = useStore<boolean>('log.wrap');
  const initialConfig = { ...defaultLogConfig, wrap };

  const [config, setConfig] = React.useState<ConfigIface>(initialConfig);
  const logConfig = createLogConfig(config, setConfig);

  const viewportRef = React.useRef<ViewportRefType>(null);

  return (
    <Box component='main' display='flex' width='100%'>
      <CssBaseline />
      <LogConfigContext.Provider value={logConfig}>
        <LogHeader logId={logId} viewportRef={viewportRef} />
        <Stack height='100%' direction='column' px={2} pb={2} spacing={3}>
          <MessageViewport ref={viewportRef} />
          <CommandInput />
        </Stack>
      </LogConfigContext.Provider>
    </Box>
  );
}
