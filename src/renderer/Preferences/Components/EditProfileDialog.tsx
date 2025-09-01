/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-18
 *  @Filename: EditConnectionProfile.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import ProfileType from './ProfileType';

export type EditProfileDialogProps = {
  name?: string;
  profile?: ProfileType;
  edit?: boolean;
  open?: boolean;
  closer?: () => void;
};

export default function EditProfileDialog(props: EditProfileDialogProps) {
  const { name, profile, edit, open, closer } = props;

  const [newName, setNewName] = React.useState<string>(name ?? '');
  const [observatory, setObservatory] = React.useState<string>(
    profile?.observatory ?? 'APO'
  );

  const [user, setUser] = React.useState<string>('');
  const [program, setProgram] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

  const [host, setHost] = React.useState<string>('');
  const [port, setPort] = React.useState<string>('');

  const [httpHost, setHttpHost] = React.useState<string>('');
  const [httpPort, setHttpPort] = React.useState<string>('');

  const [needsAuthentication, setNeedsAuthentication] =
    React.useState<boolean>(true);

  const [verify, setVerify] = React.useState<boolean>(false);

  const reset = React.useCallback(() => {
    setNewName(name ?? '');
    setObservatory(profile?.observatory ?? 'APO');
    setUser(profile?.user ?? '');
    setProgram(profile?.program ?? '');
    setHost(profile?.host ?? '');
    setPort(profile?.port.toString() ?? '9877');
    setHttpHost(profile?.host ?? '');
    setHttpPort(profile?.httpPort.toString() ?? '80');
    setNeedsAuthentication(profile?.needsAuthentication ?? true);
    setVerify(false);
  }, [name, profile]);

  React.useEffect(() => {
    // Reset the form when the dialog appears. Mainly to prevent new profiles
    // to show previous info.
    reset();
  }, [open, reset]);

  React.useEffect(() => {
    if (program === '') {
      setPassword('');
      return;
    }

    window.electron.safe
      .get(program)
      .then((value) => setPassword(value ?? ''))
      .catch(() => setPassword(''));
  }, [program]);

  const handleOK = () => {
    setVerify(true);

    if (!newName || !user || !host || !port || !httpHost || !httpPort) return;
    if (needsAuthentication && (!program || !password)) return;

    if (name !== undefined && newName !== name) {
      window.electron.store.delete(`profiles.${name}`);
    }

    window.electron.store.set(`profiles.${newName}`, {
      observatory,
      program,
      user,
      host,
      port,
      needsAuthentication,
      httpHost,
      httpPort,
    });

    if (needsAuthentication && password !== '') {
      window.electron.safe.set(program, password);
    }

    if (closer) closer();
  };

  return (
    <Dialog open={open ?? false} onClose={closer}>
      <DialogTitle>{edit ? `Edit profile ${name}` : 'New profile'}</DialogTitle>
      <DialogContentText />
      <DialogContent>
        <Stack direction='column' spacing={2}>
          <Grid container direction='row'>
            <Grid item xs={12}>
              <TextField
                autoFocus
                variant='standard'
                label='Profile name'
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={verify && newName === ''}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container direction='row'>
            <Grid item xs={9} pr={2}>
              <TextField
                variant='standard'
                label='User'
                value={user}
                onChange={(event) => setUser(event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={verify && user === ''}
                fullWidth
              />
            </Grid>
            <Grid item xs={3} sx={{ alignSelf: 'end' }}>
              <FormControl variant='standard' fullWidth>
                <InputLabel>Observatory</InputLabel>
                <Select
                  label='Observatory'
                  variant='standard'
                  value={observatory}
                  onChange={(event) => setObservatory(event.target.value)}
                  fullWidth
                >
                  <MenuItem value='APO'>APO</MenuItem>
                  <MenuItem value='LCO'>LCO</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container direction='row'>
            <Grid item xs={6} pr={2}>
              <TextField
                variant='standard'
                label='Program'
                value={program}
                onChange={(event) => setProgram(event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={verify && program === '' && needsAuthentication}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                variant='standard'
                label='Password'
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={verify && password === '' && needsAuthentication}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container direction='row'>
            <Grid item xs={9} pr={2}>
              <TextField
                variant='standard'
                label='Host'
                value={host}
                onChange={(event) => setHost(event.currentTarget.value)}
                InputLabelProps={{ shrink: true }}
                error={verify && host === ''}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                variant='standard'
                label='Port'
                value={port}
                onChange={(event) => setPort(event.currentTarget.value)}
                InputLabelProps={{ shrink: true }}
                error={verify && port === ''}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container direction='row'>
            <Grid item xs={9} pr={2}>
              <TextField
                variant='standard'
                label='HTTP Host'
                value={httpHost}
                onChange={(event) => setHttpHost(event.currentTarget.value)}
                error={verify && httpHost === ''}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                variant='standard'
                label='HTTP Port'
                value={httpPort}
                onChange={(event) => setHttpPort(event.currentTarget.value)}
                error={verify && httpPort === ''}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container direction='row'>
            <Grid item xs={9} pr={2} alignSelf='center'>
              <Typography variant='body1'>Needs authentication</Typography>
            </Grid>
            <Grid item xs={3}>
              <Switch
                checked={needsAuthentication}
                onChange={(event, checked) => setNeedsAuthentication(checked)}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant='contained'
          disableElevation
          color='error'
          onClick={closer}
        >
          Cancel
        </Button>
        <Button variant='contained' onClick={handleOK} disableElevation>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
