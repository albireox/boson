/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-14
 *  @Filename: Preferences.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline, Divider } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Stack } from '@mui/system';
import * as React from 'react';
import {
  AdvancedPane,
  ConnectionPane,
  InterfacePane,
  SoundsPane,
} from './Panes';
import GuiderPane from './Panes/Tools/GuiderPane';
import HALPane from './Panes/Tools/HALPane';
import LogWindowPane from './Panes/Tools/LogWindowPane';
import { MenuItem, Title } from './typography';

function MenuItemPreferences(props: {
  name: string;
  title: string;
  selectedPane: string;
  setSelectedPane: (string) => void;
}) {
  const { name, title, selectedPane, setSelectedPane } = props;
  const DEFAULT_PANE = 'connection';

  return (
    <MenuItem
      name={name}
      title={title}
      active={name === selectedPane}
      onClick={(pane) => setSelectedPane(pane ?? DEFAULT_PANE)}
    />
  );
}

export default function Preferences() {
  const DEFAULT_PANE = 'connection';

  const [selectedPane, setSelectedPane] = React.useState(DEFAULT_PANE);

  const getPane = (name: string) => {
    switch (name) {
      case 'connection':
        return <ConnectionPane />;
      case 'interface':
        return <InterfacePane />;
      case 'sounds':
        return <SoundsPane />;
      case 'advanced':
        return <AdvancedPane />;
      case 'log_window':
        return <LogWindowPane />;
      case 'guider':
        return <GuiderPane />;
      case 'HAL':
        return <HALPane />;
      default:
        return null;
    }
  };

  const props = { selectedPane, setSelectedPane };

  return (
    <Box
      component="div"
      width="100%"
      height="100%"
      position="absolute"
      top={0}
      display="grid"
      gridTemplateColumns="minmax(150px, 250px) 1fr"
      gridAutoFlow="column"
    >
      <CssBaseline />
      <Paper elevation={0} style={{ height: '100%' }}>
        <Stack
          spacing={1}
          width="100%"
          direction="row"
          paddingTop={5}
          paddingRight={1.5}
        >
          <div style={{ flexGrow: 1 }} />
          <Stack direction="column">
            <Title>USER SETTINGS</Title>
            <MenuItemPreferences
              title="Connection"
              name="connection"
              {...props}
            />
            <MenuItemPreferences
              title="Interface"
              name="interface"
              {...props}
            />
            <MenuItemPreferences title="Sounds" name="sounds" {...props} />
            <MenuItemPreferences title="Advanced" name="advanced" {...props} />
            <Divider sx={{ mt: 2, mb: 3 }} />
            <Title>TOOLS</Title>
            <MenuItemPreferences
              title="Log window"
              name="log_window"
              {...props}
            />
            <MenuItemPreferences title="Guider" name="guider" {...props} />
            <MenuItemPreferences title="HAL" name="HAL" {...props} />
          </Stack>
        </Stack>
      </Paper>
      <Box
        sx={{
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
        minWidth={500}
        px={4}
        py={5}
      >
        {getPane(selectedPane)}
      </Box>
    </Box>
  );
}
