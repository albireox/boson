/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: Guider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline, Stack } from '@mui/material';
import React from 'react';
import { KeywordContext, useKeywords, useStore } from 'renderer/hooks';
import GuiderContext, {
  defaultGuiderConfig,
  prepareGuiderContext,
} from './Context';
import ExposeRow from './Expose/ExposeRow';
import GuideTable from './GuideTable/GuideTable';
import { GuiderHeader } from './Header';
import { JS9Grid } from './JS9';

export type GuiderRefType = {
  name: string;
  openInDS9: () => void;
  zoom: (direction: string) => void;
  reset: () => void;
};

export type GuiderRefMap = {
  [element: string]: GuiderRefType;
};

export default function Guider() {
  // useLoadJS9();

  const [config, setConfig] = React.useState(defaultGuiderConfig);
  const boundContext = prepareGuiderContext(config, setConfig);

  const [refreshInterval] = useStore<number>('guider.refreshInterval');

  const keywords = useKeywords([
    'cherno.astrometry_fit',
    'cherno.guide_rms',
    'cherno.acquisition_valid',
    'cherno.enabled_axes',
    'cherno.guider_status',
    'fliswarm.exposure_state',
    'fliswarm.filename_bundle',
    'cherno.pid_ra',
    'cherno.pid_dec',
    'cherno.pid_rot',
    'cherno.pid_focus',
    'cherno.correction_applied',
    'cherno.did_correct',
    'cherno.focus_fit',
  ]);

  const ref = React.useRef<GuiderRefMap>({});

  React.useEffect(() => {
    // Reload window every N minutes to prevent JS9 failing GC from using
    // too much memory.

    if (refreshInterval === 0) return () => {};

    const interval = setInterval(() => {
      window.electron.app.reloadWindow();
    }, refreshInterval * 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, [refreshInterval]);

  return (
    <Box component="main" display="flex" width="100%">
      <CssBaseline />
      <GuiderContext.Provider value={boundContext}>
        <KeywordContext.Provider value={keywords}>
          <GuiderHeader guiderRef={ref} />

          <Stack
            direction="column"
            height="100%"
            width="100%"
            pt={1}
            pb={2}
            px={3}
            spacing={2.5}
            sx={{ overflowY: 'auto' }}
          >
            <Box width="100%">
              <JS9Grid
                guiderRef={(element: GuiderRefType | null) => {
                  if (element) {
                    ref.current[element.name] = element;
                  }
                }}
              />
            </Box>
            <ExposeRow />
            <GuideTable />
          </Stack>
        </KeywordContext.Provider>
      </GuiderContext.Provider>
    </Box>
  );
}
