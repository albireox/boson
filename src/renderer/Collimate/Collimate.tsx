import { Box, CssBaseline, Stack } from '@mui/material';
import React from 'react';
import { KeywordContext, useKeywords, useStore } from 'renderer/hooks';
import GuiderContext, {
  defaultGuiderConfig,
  prepareGuiderContext,
} from '../Guider/Context';
import ExposeRow from '../Guider/Expose/ExposeRow';
import StatusRow from './Status/StatusRow'
import SlewRow from './Slew/SlewRow'
import GuideTable from '../Guider/GuideTable/GuideTable';
import { GuiderHeader } from '../Guider/Header';
import { JS9Double } from './JS9';
import { MirrorPlot } from './Plot';

export type GuiderRefType = {
  name: string;
  openInDS9: () => void;
  zoom: (direction: string) => void;
  reset: () => void;
};

export type GuiderRefMap = {
  [element: string]: GuiderRefType;
};

export default function Collimate() {
  // useLoadJS9();


  const [config, setConfig] = React.useState(defaultGuiderConfig);
  const boundContext = prepareGuiderContext(config, setConfig);

  const [refreshInterval] = useStore<number>('guider.refreshInterval');

  const keywords = useKeywords([
    'fliswarm.exposure_state',
    'fliswarm.filename_bundle',
    'tcc.TCCPos',
    'tcc.AxisCmdState',
    'tcc.SecState',
    'tcc.PrimState'
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
              <JS9Double
                guiderRef={(element: GuiderRefType | null) => {
                  if (element) {
                    ref.current[element.name] = element;
                  }
                }}
              />
            </Box>
            <StatusRow />
            <SlewRow />
            <MirrorPlot />
            <ExposeRow />
            <GuideTable />
          </Stack>
        </KeywordContext.Provider>
      </GuiderContext.Provider>
    </Box>
  );
}