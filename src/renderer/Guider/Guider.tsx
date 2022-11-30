/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: Guider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline, Stack } from '@mui/material';
import React from 'react';
import GuiderContext, {
  defaultGuiderConfig,
  prepareGuiderContext,
} from './Context';
import { GuiderHeader } from './Header';
import { JS9Grid } from './JS9';
import { useLoadJS9 } from './tools';

export type GuiderRefType = {
  name: string;
  fit: () => void;
  openInDS9: () => void;
  zoom: (direction: string) => void;
};

export type GuiderRefMap = {
  [element: string]: GuiderRefType;
};

export default function Guider() {
  useLoadJS9();

  const [config, setConfig] = React.useState(defaultGuiderConfig);
  const boundContext = prepareGuiderContext(config, setConfig);

  const ref = React.useRef<GuiderRefMap>({});

  return (
    <Box component='main' display='flex' width='100%'>
      <CssBaseline />
      <GuiderContext.Provider value={boundContext}>
        <Stack direction='column' height='100%' width='100%'>
          <GuiderHeader guiderRef={ref} />
          <Box position='absolute' top='50px' width='100%'>
            <JS9Grid
              guiderRef={(element: GuiderRefType | null) => {
                if (element) {
                  ref.current[element.name] = element;
                }
              }}
            />
          </Box>
        </Stack>
      </GuiderContext.Provider>
    </Box>
  );
}
