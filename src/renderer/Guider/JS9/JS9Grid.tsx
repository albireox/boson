/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: JS9Grid.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';
import { useKeywordContext, useWindowSize } from 'renderer/hooks';
import { GuiderRefType } from '../Guider';
import JS9Frame from './JS9Frame';

export interface JS9GridProps {
  guiderRef: (element: GuiderRefType | null) => void;
}

export default function JS9Grid(props: JS9GridProps) {
  const { filename_bundle: filenameBundle } = useKeywordContext();

  const { guiderRef } = props;

  const windowSize = useWindowSize();
  const [size, setSize] = React.useState(533);

  const frameProps = { filenameBundle, ref: guiderRef };

  React.useEffect(() => {
    if (!windowSize) return;

    setSize(Math.round(((windowSize.width || 800) / 3.2) * 2));
  }, [windowSize]);

  return (
    <Box height={size}>
      <Stack direction='column' spacing={-0.5} overflow='hidden' width='100%'>
        <Stack
          direction='row'
          justifyContent='center'
          spacing={-0.5}
          width='100%'
        >
          <JS9Frame display='gfa1' {...frameProps} />
          <JS9Frame display='gfa2' {...frameProps} />
          <JS9Frame display='gfa3' {...frameProps} />
        </Stack>
        <Stack
          direction='row'
          justifyContent='center'
          spacing={-0.5}
          width='100%'
        >
          <JS9Frame display='gfa4' {...frameProps} />
          <JS9Frame display='gfa5' {...frameProps} />
          <JS9Frame display='gfa6' {...frameProps} />
        </Stack>
      </Stack>
    </Box>
  );
}
