/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-17
 *  @Filename: Tabs.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box } from '@mui/material';
import React from 'react';
import { BosonTab, BosonTabs } from 'renderer/Components';
import MainStatus from './MainStatus';
import Users from './Users';

export default function MainTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box width='100%' height='100%' display='flex' flexDirection='column'>
      <BosonTabs centered value={value} onChange={handleChange}>
        <BosonTab label='Connection' />
        <BosonTab label='Users' />
      </BosonTabs>
      <Box sx={{ overflowY: 'scroll', p: 3, flexGrow: 1, width: '100%' }}>
        {value === 0 && <MainStatus />}
        {value === 1 && <Users />}
      </Box>
    </Box>
  );
}
