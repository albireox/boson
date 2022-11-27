/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: ListItem.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Tooltip, Zoom } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import * as React from 'react';

export interface DrawerListItemProps {
  name: string;
  text: string;
  icon: React.ReactElement;
  open?: boolean;
  onClick?: ((name: string) => void) | null;
}

export default function DrawerListItem({
  name,
  text,
  icon,
  open = false,
  onClick = null,
}: DrawerListItemProps) {
  return (
    <ListItem key={name} disablePadding sx={{ display: 'block' }}>
      <Tooltip title={text} placement='right' TransitionComponent={Zoom}>
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
            '&.MuiButtonBase-root:hover': {
              bgcolor: 'transparent',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : 'auto',
              justifyContent: 'center',
            }}
            onClick={() => (onClick ? onClick(name) : undefined)}
          >
            {icon}
          </ListItemIcon>
          <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}
