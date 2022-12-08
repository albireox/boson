/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-04
 *  @Filename: PersistentDrawer.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import MuiDrawer from '@mui/material/Drawer';
import { CSSObject, styled, Theme } from '@mui/material/styles';
import * as React from 'react';

const drawerWidth = 200;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  background: theme.palette.mode === 'light' ? '#E3E5E8' : '#202225',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
  background: theme.palette.mode === 'light' ? '#E3E5E8' : '#202225',
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

export interface PersistentDrawerProps {
  open?: boolean;
  children?: React.ReactElement;
}

export default function PersistentDrawer({
  open = false,
  children = <div />,
}: PersistentDrawerProps) {
  return (
    <Drawer
      variant='permanent'
      open={open}
      sx={{ '& .MuiPaper-root': { paddingTop: 3 } }}
    >
      {children}
    </Drawer>
  );
}
