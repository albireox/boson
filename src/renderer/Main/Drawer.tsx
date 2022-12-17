/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-25
 *  @Filename: Drawer.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import InsightsIcon from '@mui/icons-material/Insights';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MenuIcon from '@mui/icons-material/Menu';
import NotesIcon from '@mui/icons-material/Notes';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Stack,
} from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { DrawerListItem, PersistentDrawer } from 'renderer/Components';

interface FooterProps {
  open: boolean;
  setOpen: (mode: boolean) => void;
  openNewWindow: (name: string) => void;
}

function Footer(props: FooterProps) {
  const { open, setOpen, openNewWindow } = props;

  return (
    <List>
      <DrawerListItem
        name='preferences'
        icon={<SettingsIcon />}
        text='Preferences'
        onClick={openNewWindow}
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
  );
}

export default function Drawer() {
  const [open, setOpen] = React.useState(false);

  const openNewWindow = (name: string) => {
    window.electron.app.openNewWindow(name);
  };

  const Item = (props: {
    name: string;
    icon: React.ReactElement;
    text?: string;
  }) => {
    const { name, icon, text } = props;
    return (
      <DrawerListItem
        name={name}
        icon={icon}
        text={text ?? ''}
        onClick={openNewWindow}
        open={open}
      />
    );
  };

  return (
    <PersistentDrawer open={open}>
      <Stack direction='column' height='100%'>
        <Box sx={{ overflowY: 'auto', overflowX: 'hidden' }}>
          <Item name='log' icon={<NotesIcon />} text='New log window' />
          <Item
            name='snapshots'
            icon={<SettingsOverscanIcon />}
            text='Snapshots'
          />
          <Item name='guider' icon={<InsightsIcon />} text='Guider' />
          <Item name='HAL' icon={<PrecisionManufacturingIcon />} text='HAL' />
        </Box>
        <div style={{ flexGrow: 1 }} />
        <Footer open={open} setOpen={setOpen} openNewWindow={openNewWindow} />
      </Stack>
    </PersistentDrawer>
  );
}
