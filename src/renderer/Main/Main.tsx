/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: main.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MenuIcon from '@mui/icons-material/Menu';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import * as React from 'react';
import DrawerListItem from '../Components/DrawerListItem';
import PersistentDrawer from '../Components/PersistentDrawer';
import MainStatus from './MainStatus';

export default function Main() {
  const [open, setOpen] = React.useState(false);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <CssBaseline />
      <PersistentDrawer open={open}>
        <>
          <DrawerListItem
            icon={<NotesIcon />}
            text='New log window'
            open={open}
          />
          <div style={{ flexGrow: 1 }} />
          <List>
            <DrawerListItem
              icon={<SettingsIcon />}
              text='Settings'
              open={open}
            />

            <ListItem
              disablePadding
              sx={{ display: 'block' }}
              onClick={() => setOpen(!open)}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
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
                  }}
                >
                  {!open ? <MenuIcon /> : <KeyboardArrowLeftIcon />}
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </List>
        </>
      </PersistentDrawer>
      <Box component='main' sx={{ flexGrow: 1, p: 3, height: '100%' }}>
        <MainStatus />
      </Box>
    </Box>
  );
}
