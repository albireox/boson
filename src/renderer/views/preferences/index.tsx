/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import ConnectionPreferences from './connection';
import GuiderPreferences from './guider';

export default function PreferencesView() {
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
          <Tab label='Guider' id='preferences-guider' value='guider' />
        </Tabs>
      </Box>
      {value === 'connection' && <ConnectionPreferences />}
      {value === 'guider' && <GuiderPreferences />}
    </Box>
  );
}
