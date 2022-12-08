/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-17
 *  @Filename: ConnectionProfile.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import VerifiedIcon from '@mui/icons-material/Verified';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Tooltip,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';
import { useStore } from 'renderer/hooks';
import EditProfileDialog from './EditProfileDialog';
import ProfileType from './ProfileType';

export type ConnectionProfileCartProps = {
  name: string;
  profile: ProfileType;
};

export default function ConnectionProfileCard(
  props: ConnectionProfileCartProps
) {
  const { name, profile } = props;
  const {
    observatory,
    program,
    user,
    host,
    port,
    httpHost,
    httpPort,
    needsAuthentication,
  } = profile;
  const [openEdit, setOpenEdit] = React.useState<boolean>(false);

  const [currentProfileName] = useStore('connection.name');

  const handleUse = () => {
    window.electron.store.set('connection', {
      name,
      observatory,
      program,
      user,
      host,
      port,
      needsAuthentication,
      httpHost,
      httpPort,
    });
    window.electron.tron.connectAndAuthorise(needsAuthentication, true);
  };

  const handleDelete = () => {
    window.electron.store.delete(`profiles.${name}`);
  };

  return (
    <>
      <Card
        variant='outlined'
        sx={{ width: 250, height: 220, overflow: 'scroll' }}
      >
        <CardContent>
          <Stack direction='row'>
            <Typography variant='h5' component='div'>
              {name}
            </Typography>
            <Box flexGrow={1} />
            <Tooltip title='This profile is active'>
              <VerifiedIcon
                color='primary'
                sx={{
                  visibility:
                    name === currentProfileName ? undefined : 'hidden',
                }}
              />
            </Tooltip>
          </Stack>
          <Typography sx={{ mb: 1.5 }} color='text.secondary'>
            {observatory} ({program})
          </Typography>
          <Typography variant='body2'>
            {user} @ {host}:{port}
          </Typography>
          <Typography sx={{ mt: 1.5 }} color='text.secondary'>
            HTTP
          </Typography>
          <Typography variant='body2'>
            {httpHost}:{httpPort}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'right' }} disableSpacing>
          <Button
            size='small'
            sx={{ minWidth: 48 }}
            onClick={() => handleDelete()}
          >
            Delete
          </Button>

          <Button
            size='small'
            sx={{ minWidth: 48 }}
            onClick={() => setOpenEdit(true)}
          >
            Edit
          </Button>
          <Button
            size='small'
            sx={{ minWidth: 48 }}
            onClick={() => handleUse()}
          >
            Use
          </Button>
        </CardActions>
      </Card>
      <EditProfileDialog
        profile={profile}
        name={name}
        open={openEdit}
        closer={() => setOpenEdit(false)}
        edit
      />
    </>
  );
}
