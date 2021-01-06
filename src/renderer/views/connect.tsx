/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-22
 *  @Filename: connect.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Collapse, Fab, LinearProgress } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import React, { SyntheticEvent, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  progress: {
    padding: '0px',
    height: '2px'
  },
  paper: {
    paddingTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(0, 1, 1, 1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(2, 0, 0)
  },
  error: {
    backgroundColor: theme.palette.secondary.main,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(-1),
    padding: theme.spacing(1),
    width: '100%',
    textAlign: 'center'
  },
  dropdownIcon: {
    transition: theme.transitions.create(['transform'], {
      duration: theme.transitions.duration.complex
    })
  },
  dropdownIconOpen: {
    transform: 'rotate(-180deg)',
    backgroundColor: theme.palette.secondary.main
  },
  dropdownIconClosed: {
    transform: 'rotate(0)'
  }
}));

export default function ConnectView() {
  const NAME = 'connect';
  const classes = useStyles();

  const [connectForm, setConnectForm] = useState<{ [key: string]: any }>({
    program: '',
    user: '',
    password: '',
    remember: true,
    host: '',
    httpHost: '',
    httpPort: ''
  });

  const [error, setError] = useState<undefined | string>(undefined);
  const [buttonDisabled, setButtonDisabled] = useState<undefined | boolean>(false);
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);

  let updateHeight = () => {
    window.api.invoke(
      'window-set-size',
      NAME,
      document.getElementById('root')?.scrollWidth as number,
      (document.getElementById('root')?.scrollHeight as number) + 32,
      true
    );
  };

  React.useEffect(() => {
    if (error !== undefined) {
      setButtonDisabled(false);
      setShowProgress(false);
      updateHeight();
    }
  }, [error]);

  React.useEffect(() => {
    updateHeight();
    window.api.store
      .get([
        'user.connection.program',
        'user.connection.user',
        'user.connection.host',
        'user.connection.httpHost',
        'user.connection.httpPort'
      ])
      .then(async (res: any) => {
        let program = res[0];
        if (program) return [...res, await window.api.invoke('get-password', 'hub', program)];
        return [...res, ''];
      })
      .then((res: any) => {
        setConnectForm({
          ...connectForm,
          program: res[0] || '',
          user: res[1] || '',
          host: res[2] || '',
          httpHost: res[3] || '',
          httpPort: res[4] || '',
          password: res[5] || ''
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let storeCredentials = () => {
    window.api.store.set('user.connection.program', connectForm.program.toLowerCase());
    window.api.store.set('user.connection.user', connectForm.user);
    window.api.store.set('user.connection.host', connectForm.host);
    window.api.store.set('user.connection.httpHost', connectForm.httpHost);
    window.api.store.set('user.connection.httpPort', connectForm.httpPort as number);
    if (connectForm.program)
      window.api.invoke('set-password', 'hub', connectForm.program, connectForm.password);
  };

  let handleConnect = async (event: SyntheticEvent) => {
    event.preventDefault();
    setButtonDisabled(true);
    setShowProgress(true);

    let port = (await window.api.store.get('connection.port')) || 9877;

    const connectionResult = await window.api.invoke('tron-connect', connectForm.host, port);

    switch (connectionResult) {
      case window.api.tron.ConnectionStatus.Connected:
        const [result, err]: [boolean, string | null] = await window.api.invoke(
          'tron-authorise',
          (({ program, user, password }) => ({ program, user, password }))(connectForm)
        );
        if (result === true) {
          storeCredentials();
          window.api.invoke('window-close', NAME);
        } else {
          setError(err!);
        }
        break;
      case window.api.tron.ConnectionStatus.Failed:
        setError('Connection failed');
        break;
      case window.api.tron.ConnectionStatus.TimedOut:
        setError('Connection timed out');
        break;
      default:
        window.api.invoke('window-close', NAME);
        break;
    }
  };

  let handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: replace with https://github.com/react-hook-form/react-hook-form
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setConnectForm({ ...connectForm, [name]: value });
  };

  return (
    <>
      {showProgress ? <LinearProgress className={classes.progress} color='secondary' /> : null}
      <Container component='div' maxWidth='xs' style={{ padding: '0px 24px 24px 24px' }}>
        <div className={classes.paper} id='paper'>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon fontSize='large' />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Log in
          </Typography>
          <Typography
            className={classes.error}
            style={{ display: error === undefined ? 'none' : 'initial' }}
            component='h5'
          >
            {error}
          </Typography>
          <form className={classes.form} onSubmit={handleConnect} autoComplete='off'>
            <TextField
              variant='outlined'
              margin='dense'
              required
              fullWidth
              id='program'
              label='Program'
              name='program'
              value={connectForm.program}
              onChange={handleChange}
              autoFocus
              size='small'
              InputLabelProps={{ required: false }}
            />
            <TextField
              variant='outlined'
              margin='dense'
              required
              fullWidth
              name='user'
              label='Username'
              id='user'
              value={connectForm.user}
              onChange={handleChange}
              size='small'
              InputLabelProps={{ required: false }}
            />
            <TextField
              variant='outlined'
              margin='dense'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              value={connectForm.password}
              onChange={handleChange}
              id='password'
              size='small'
              InputLabelProps={{ required: false }}
            />
            <FormControlLabel
              label='Remember password'
              control={
                <Checkbox name='remember' checked color='primary' onChange={handleChange} />
              }
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              disabled={buttonDisabled}
            >
              Connect
            </Button>
            <div
              style={{
                padding: '0px 16px',
                textAlign: 'center',
                marginTop: '24px'
              }}
            >
              <Fab
                size='small'
                className={optionsExpanded ? classes.dropdownIconOpen : classes.dropdownIconClosed}
                onClick={() => setOptionsExpanded(!optionsExpanded)}
              >
                <ExpandMoreIcon className={classes.dropdownIcon} />
              </Fab>
              <Collapse
                in={optionsExpanded}
                onEntered={() => updateHeight()}
                onExited={() => updateHeight()}
              >
                <TextField
                  style={{ marginTop: '16px' }}
                  variant='outlined'
                  margin='dense'
                  fullWidth
                  id='host'
                  label='Host'
                  name='host'
                  onChange={handleChange}
                  value={connectForm.host}
                  autoFocus
                  size='small'
                />
                <TextField
                  variant='outlined'
                  margin='dense'
                  fullWidth
                  name='httpHost'
                  label='HTTP Host'
                  id='httpHost'
                  onChange={handleChange}
                  value={connectForm.httpHost}
                  size='small'
                  InputLabelProps={{ required: false }}
                />
                <TextField
                  variant='outlined'
                  margin='dense'
                  fullWidth
                  name='httpPort'
                  label='HTTP Port'
                  id='httpPort'
                  onChange={handleChange}
                  value={connectForm.httpPort}
                  size='small'
                  InputLabelProps={{ required: false }}
                />
              </Collapse>
            </div>
          </form>
        </div>
      </Container>
    </>
  );
}
