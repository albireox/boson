/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-14
 *  @Filename: ConnectionPane.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AddIcon from '@mui/icons-material/Add';
import CachedIcon from '@mui/icons-material/Cached';
import {
  alpha,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import React from 'react';
import { useStore } from 'renderer/hooks';
import ConnectionProfileCard from '../Components/ConnectionProfileCard';
import EditProfileDialog from '../Components/EditProfileDialog';
import Pane from '../Components/Pane';
import PasswordInput from '../Components/PasswordInput';
import ProfileType from '../Components/ProfileType';
import Switch from '../Components/Switch';
import TextInput from '../Components/TextInput';

function ConnectionDetails() {
  const [program] = useStore<string>('connection.program', true);
  const [needsAuthentication] = useStore<boolean>(
    'connection.needsAuthentication',
    true
  );

  return (
    <Pane title='Connection'>
      <Grid container>
        <Grid sm={12} md={9}>
          <Stack direction='column' spacing={1}>
            <Stack direction='row' spacing={2}>
              <TextInput fullWidth label='User' param='connection.user' />
              <TextInput fullWidth label='Program' param='connection.program' />
              <PasswordInput fullWidth label='Password' account={program} />
            </Stack>
            <Grid container pt={1}>
              <Grid xs={9}>
                <TextInput fullWidth label='Host' param='connection.host' />
              </Grid>
              <Grid xs={3} pl={2}>
                <TextInput fullWidth label='Port' param='connection.port' />
              </Grid>
            </Grid>
            <Grid container pt={1}>
              <Grid xs={9}>
                <TextInput
                  fullWidth
                  label='HTTP Host'
                  param='connection.httpHost'
                />
              </Grid>
              <Grid xs={3} pl={2}>
                <TextInput
                  fullWidth
                  label='HTTP Port'
                  param='connection.httpPort'
                />
              </Grid>
            </Grid>
            <Grid container pt={1} minHeight={50} alignContent='center'>
              <Grid xs={6}>
                <Typography
                  variant='body2'
                  fontSize={14}
                  sx={(theme) => ({
                    minWidth: '150px',
                    color: theme.palette.text.secondary,
                    userSelect: 'none',
                    alignSelf: 'center',
                  })}
                  gutterBottom
                >
                  Requires authentication
                </Typography>
              </Grid>
              <Grid xs={6} alignItems='flex-end' textAlign='right'>
                <Switch param='connection.needsAuthentication' />
              </Grid>
            </Grid>
          </Stack>
          <Divider sx={{ my: 4 }} />
        </Grid>
        <Grid
          md={3}
          pl={4}
          sx={(theme) => ({
            [theme.breakpoints.down('md')]: {
              display: 'none',
            },
          })}
        >
          <Tooltip title='Reconnect'>
            <IconButton
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                border: `1px solid ${theme.palette.text.secondary}`,
                '&:hover': {
                  color: theme.palette.action.active,
                  border: `1px solid ${theme.palette.action.active}`,
                  backgroundColor: alpha(theme.palette.action.active, 0.1),
                },
              })}
              color='primary'
              component='label'
              onClick={() =>
                window.electron.tron.connectAndAuthorise(
                  needsAuthentication,
                  true
                )
              }
            >
              <CachedIcon fontSize='medium' />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Pane>
  );
}

function ConnectionProfiles() {
  const [profiles] = useStore<object>('profiles', true);
  const [openNewProfile, setOpenNewProfile] = React.useState<boolean>(false);

  return (
    <Pane title='Profiles'>
      <Grid container direction='row'>
        <Grid container md={9} spacing={2}>
          {Object.entries(profiles).map((profile) => (
            <Grid key={profile[0]}>
              <ConnectionProfileCard
                profile={profile[1] as ProfileType}
                name={profile[0]}
              />
            </Grid>
          ))}
        </Grid>
        <Grid
          md={3}
          pl={4}
          sx={(theme) => ({
            [theme.breakpoints.down('md')]: {
              display: 'none',
            },
          })}
        >
          <Tooltip title='New profile'>
            <IconButton
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                border: `1px solid ${theme.palette.text.secondary}`,
                '&:hover': {
                  color: theme.palette.action.active,
                  border: `1px solid ${theme.palette.action.active}`,
                  backgroundColor: alpha(theme.palette.action.active, 0.1),
                },
              })}
              color='primary'
              component='label'
              onClick={() => setOpenNewProfile(true)}
            >
              <AddIcon fontSize='medium' />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <EditProfileDialog
        open={openNewProfile}
        closer={() => setOpenNewProfile(false)}
      />
    </Pane>
  );
}

export default function ConnectionPane() {
  return (
    <Stack>
      <ConnectionDetails />
      <ConnectionProfiles />
    </Stack>
  );
}
