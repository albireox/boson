/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: Guider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline, Stack } from '@mui/material';
import { GuiderHeader } from './Header';
import { useLoadJS9 } from './tools';

export default function Guider() {
  useLoadJS9();

  return (
    <Box
      component='main'
      display='flex'
      position='absolute'
      width='100%'
      top={0}
    >
      <CssBaseline />
      <Stack direction='column' height='100%'>
        <GuiderHeader />
        <div className='JS9' />
      </Stack>
    </Box>
  );
}
