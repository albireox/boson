/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: JS9Grid.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Stack } from '@mui/system';
import { useKeywords } from 'renderer/hooks';
import { GuiderRefType } from '../Guider';
import JS9Frame from './JS9Frame';

export interface JS9GridProps {
  guiderRef: (element: GuiderRefType | null) => void;
}

export default function JS9Grid(props: JS9GridProps) {
  const { filename_bundle: filenameBundle } = useKeywords('fliswarm', [
    'filename_bundle',
  ]);

  const { guiderRef } = props;

  const frameProps = { filenameBundle, ref: guiderRef };

  return (
    <Stack
      direction='column'
      spacing={0.5}
      py={2}
      overflow='hidden'
      width='100%'
    >
      <Stack direction='row' justifyContent='center' spacing={0.5} width='100%'>
        <JS9Frame display='gfa1' {...frameProps} />
        <JS9Frame display='gfa2' {...frameProps} />
        <JS9Frame display='gfa3' {...frameProps} />
      </Stack>
      <Stack direction='row' justifyContent='center' spacing={0.5} width='100%'>
        <JS9Frame display='gfa4' {...frameProps} />
        <JS9Frame display='gfa5' {...frameProps} />
        <JS9Frame display='gfa6' {...frameProps} />
      </Stack>
    </Stack>
  );
}
