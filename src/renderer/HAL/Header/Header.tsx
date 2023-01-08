/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Stack } from '@mui/material';
import { Box } from '@mui/system';
import hal9000logo from '../images/hal9000.png';
import { DesignInput } from './DesignInput';
import { PreloadedBanner } from './PreloadedBanner';

export default function Header() {
  return (
    <Box>
      <PreloadedBanner />
      <Stack direction='row' pl={8} pr={4} pb={1} pt={2.5} width='100%'>
        <DesignInput />
        <Box flexGrow={1} />
        <img
          src={hal9000logo}
          style={{ paddingTop: 10 }}
          height='80px'
          alt='HAL9000 logo'
        />
      </Stack>
    </Box>
  );
}
