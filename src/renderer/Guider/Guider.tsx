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
import ExposeRow from './Expose/ExposeRow';
import { GuiderHeader } from './Header';
import { JS9Grid } from './JS9';
import { useLoadJS9 } from './tools';

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
  useLoadJS9();

  const [config, setConfig] = React.useState(defaultGuiderConfig);
  const boundContext = prepareGuiderContext(config, setConfig);

  const ref = React.useRef<GuiderRefMap>({});

  return (
    <Box component='main' display='flex' width='100%'>
      <CssBaseline />
      <GuiderContext.Provider value={boundContext}>
        <GuiderHeader guiderRef={ref} />

        <Stack
          direction='column'
          height='100%'
          width='100%'
          pt={1}
          pb={2}
          px={2}
          spacing={2.5}
        >
          <Box width='100%'>
            <JS9Grid
              guiderRef={(element: GuiderRefType | null) => {
                if (element) {
                  ref.current[element.name] = element;
                }
              }}
            />
          </Box>
          <ExposeRow />
        </Stack>
      </GuiderContext.Provider>
    </Box>
  );
}
