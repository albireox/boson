/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: BosonHeader.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Paper, Stack } from '@mui/material';

interface BosonHeaderHeaderProps {
  fixed?: boolean;
  color?: string;
  children?: React.ReactNode;
  pl?: number;
  pr?: number;
  spacing?: number;
  visible?: boolean;
}

export default function BosonHeader(props: BosonHeaderHeaderProps) {
  const {
    fixed = false,
    color,
    children,
    pl = 10,
    pr = 2,
    spacing = 2,
    visible = true,
  } = props;
  return (
    <Paper
      sx={(theme) => ({
        WebkitAppRegion: 'drag',
        height: '50px',
        minHeight: '50px',
        position: fixed ? 'fixed' : 'relative',
        top: 0,
        width: '100%',
        bgcolor: 'background.default',
        borderRadius: 0,
        zIndex: 10,
        backgroundColor: color ?? theme.palette.background.paper,
        visibility: visible ? 'inherit' : 'hidden',
      })}
      elevation={1}
    >
      <Stack
        direction='row'
        alignItems='center'
        height='100%'
        width='100%'
        spacing={spacing}
        pl={pl}
        pr={pr}
      >
        {children}
      </Stack>
    </Paper>
  );
}
