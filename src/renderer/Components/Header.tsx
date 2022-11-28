/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Paper, Stack } from '@mui/material';

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header(props: HeaderProps) {
  const { children } = props;
  return (
    <Paper
      sx={{
        WebkitAppRegion: 'drag',
        height: '50px',
        minHeight: '50px',
        position: 'fixed',
        top: 0,
        width: '100%',
        bgcolor: 'background.default',
        borderRadius: 0,
        zIndex: 1000,
      }}
      elevation={1}
    >
      <Stack
        direction='row'
        alignItems='center'
        height='100%'
        width='100%'
        spacing={2}
        pl={10}
        pr={2}
      >
        {children}
      </Stack>
    </Paper>
  );
}
