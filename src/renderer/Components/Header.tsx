/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack } from '@mui/material';
import { HeaderDivider } from 'renderer/Components';

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header(props: HeaderProps) {
  const { children } = props;
  return (
    <Box
      height='50px'
      minHeight='50px'
      position='fixed'
      top={0}
      width='100%'
      bgcolor='background.default'
      zIndex={1000}
      sx={{ WebkitAppRegion: 'drag' }}
    >
      <Stack
        direction='row'
        alignItems='center'
        height='100%'
        spacing={2}
        pl={12}
        pr={2}
      >
        {children}
      </Stack>
      <HeaderDivider />
    </Box>
  );
}
