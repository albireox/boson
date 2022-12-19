/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-19
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { Box, Stack } from '@mui/material';
import React from 'react';
import { BosonHeader, HeaderIconButton } from 'renderer/Components';
import { useStore } from 'renderer/hooks';

export default function Header() {
  const [notify] = useStore<boolean>('chat.notifications');

  const [icon, setIcon] = React.useState(() => NotificationsIcon);

  const handleClick = React.useCallback(() => {
    window.electron.store.set('chat.notifications', !notify);
  }, [notify]);

  React.useEffect(() => {
    setIcon(() => (notify ? NotificationsIcon : NotificationsOffIcon));
  }, [notify]);

  return (
    <BosonHeader>
      <Stack direction='row' width='100%'>
        <Box flexGrow={1} />
        <HeaderIconButton Icon={icon} onClick={handleClick} />
      </Stack>
    </BosonHeader>
  );
}
