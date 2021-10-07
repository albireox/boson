/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-14
 *  @Filename: guider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import { Stack } from '@mui/material';
import * as React from 'react';
import { useKeywords } from '../../hooks';
import { GuideStack } from './guide';
import { GuideTable } from './guideTable';
import { JS9 } from './js9';
import { MenuBar } from './menubar';

export interface IJS9Opts {
  colormap: string;
  scale: string;
}

export const JS9Opts = {
  colormap: 'grey',
  scale: 'log'
};

export default function GuiderView() {
  const keywords = useKeywords(
    ['fliswarm.filename'],
    'guider-filename',
    false
  );

  const [opts, setOpts] = React.useState<IJS9Opts>(JS9Opts);
  const onOptsUpdate = (newOpts: Partial<IJS9Opts>) => {
    setOpts({ ...opts, ...newOpts });
  };

  window.JS9.globalOpts['mouseActions'][0] = 'none';
  window.JS9.globalOpts['resize'] = false;

  return (
    <>
      <Stack
        alignContent='center'
        direction='column'
        height='100%'
        sx={{
          p: [1, 2, 2, 2]
        }}
      >
        <MenuBar
          style={{
            marginBottom: '4px',
            display: 'flex',
            flexDirection: 'row'
          }}
          onUpdate={onOptsUpdate}
        />
        <Stack
          style={{ width: '100%', display: 'flex', flexDirection: 'row' }}
          justifyContent='center'
        >
          <JS9 keywords={keywords} opts={opts} gid={1} />
          <JS9 keywords={keywords} opts={opts} gid={2} />
          <JS9 keywords={keywords} opts={opts} gid={3} />
        </Stack>
        <Stack
          style={{ width: '100%', display: 'flex', flexDirection: 'row' }}
          justifyContent='center'
        >
          <JS9 keywords={keywords} opts={opts} gid={4} />
          <JS9 keywords={keywords} opts={opts} gid={5} />
          <JS9 keywords={keywords} opts={opts} gid={6} />
        </Stack>
        <GuideStack />
        <GuideTable />
      </Stack>
    </>
  );
}
