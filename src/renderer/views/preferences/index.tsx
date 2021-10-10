/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import ConnectionPreferences from './connection';
import OtherPreferences from './other';

export function PreferencesView() {
  const [value, setValue] = React.useState('connection');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const height = containerRef.current?.clientHeight;
    const width = containerRef.current?.clientWidth;
    if (height && width) {
      window.api.invoke('window-set-size', 'preferences', width, height + 30);
    }
  }, [value]);

  return (
    <Box sx={{ width: 'fit-content' }} ref={containerRef}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
          <Tab label='Connection' id='preferences-connection' value='connection' />
          <Tab label='Other' id='preferences-other' value='other' />
        </Tabs>
      </Box>
      {value === 'connection' && <ConnectionPreferences />}
      {value === 'other' && <OtherPreferences />}
    </Box>
  );
}
