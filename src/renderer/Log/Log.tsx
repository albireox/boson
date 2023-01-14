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
import MessageViewport from './Viewports/MessageViewport';

interface StoredConfigIface extends Omit<ConfigIface, 'actors' | 'codes'> {
  actors: string[];
  codes: string[];
}

function parseStoredConfig(sConfig: StoredConfigIface) {
  if (!sConfig) return {};

  return {
    actors: new Set(sConfig.actors),
    codes: new Set(sConfig.codes),
  };
}

export interface LogProps {
  logId: number;
}

export default function Log(props: LogProps) {
  const { logId } = props;

  const [saveState] = useStore<boolean>('log.saveState');
  const [storedConfig] = useStore<StoredConfigIface>(`log.config.${logId}`);

  const [wrap] = useStore<boolean>('log.wrap');
  const [highlightCommands] = useStore<string>('log.highlightCommands');

  const initialConfig = {
    ...defaultLogConfig,
    ...parseStoredConfig(storedConfig),
    wrap,
  };

  const [config, setConfig] = React.useState<ConfigIface>(initialConfig);

  const logConfig = createLogConfig(config, setConfig);

  const viewportRef = React.useRef<ViewportRefType>(null);

  React.useEffect(() => {
    // We want the active windows to change their highlighting if
    // highlightCommands changes.
    setConfig((current) => ({ ...current, highlightCommands }));
  }, [highlightCommands]);

  React.useEffect(() => {
    if (!saveState) return;

    const toStoreConfig = {
      actors: Array.from(config.actors),
      codes: Array.from(config.codes),
    };

    window.electron.store.set(`log.config.${logId}`, toStoreConfig);
  }, [saveState, config, logId]);

  return (
    <Box component='main' display='flex' width='100%'>
      <CssBaseline />
      <LogConfigContext.Provider value={logConfig}>
        <LogHeader logId={logId} viewportRef={viewportRef} />
        <Stack
          height='100%'
          direction='column'
          px={2}
          pb={2}
          spacing={3}
          overflow='hidden'
        >
          <MessageViewport mode='virtuoso' ref={viewportRef} />
          <CommandInput viewportRef={viewportRef} />
        </Stack>
      </LogConfigContext.Provider>
    </Box>
  );
}
