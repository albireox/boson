/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-22
 *  @Filename: connect.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LinearProgress } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ConnectionStatus } from 'main/tron';
import * as React from 'react';
import { SyntheticEvent, useState } from 'react';

const PREFIX = 'ConnectView';

const classes = {
  root: `${PREFIX}-root`,
  progress: `${PREFIX}-progress`,
  paper: `${PREFIX}-paper`,
  avatar: `${PREFIX}-avatar`,
  form: `${PREFIX}-form`,
  submit: `${PREFIX}-submit`,
  error: `${PREFIX}-error`,
  dropdownIcon: `${PREFIX}-dropdownIcon`,
  dropdownIconOpen: `${PREFIX}-dropdownIconOpen`,
  dropdownIconClosed: `${PREFIX}-dropdownIconClosed`
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.progress}`]: {
    padding: '0px',
    height: '2px'
  },
  [`& .${classes.paper}`]: {
    paddingTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  [`& .${classes.avatar}`]: {
    margin: theme.spacing(0, 1, 1, 1),
    backgroundColor: theme.palette.secondary.main
  },
  [`& .${classes.form}`]: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  [`& .${classes.submit}`]: {
    margin: theme.spacing(2, 0, 0)
  },
  [`& .${classes.error}`]: {
    backgroundColor: theme.palette.secondary.main,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(-1),
    padding: theme.spacing(1),
    width: '100%',
    textAlign: 'center'
  }
}));

export default function ConnectView() {
  const NAME = 'connect';

  const [connectForm, setConnectForm] = useState<{ [key: string]: any }>({
    program: '',
    user: '',
    password: '',
    remember: true
  });

  const [error, setError] = useState<undefined | string>(undefined);
  const [buttonDisabled, setButtonDisabled] = useState<undefined | boolean>(false);
  const [showProgress, setShowProgress] = useState<boolean>(false);

  React.useEffect(() => {
    if (error !== undefined) {
      setShowProgress(false);
    }
  }, [error]);

  React.useEffect(() => {
    window.api.store
      .get(['user.connection.program', 'user.connection.user', 'user.connection.host'])
      .then(async (res: any) => {
        let program = res[0];
        if (program) return [...res, await window.api.password.get('hub', program)];
        return [...res, ''];
      })
      .then((res: any) => {
        setConnectForm((prev) => {
          return {
            ...prev,
            program: res[0] || '',
            user: res[1] || '',
            host: res[2] || ''
          };
        });
      });
  }, []);

  let storeCredentials = () => {
    window.api.store.set('user.connection.program', connectForm.program.toLowerCase());
    window.api.store.set('user.connection.user', connectForm.user);
    if (connectForm.program)
      window.api.password.set('hub', connectForm.program, connectForm.password);
  };

  let handleConnect = async (event: SyntheticEvent) => {
    event.preventDefault();
    setButtonDisabled(true);
    setShowProgress(true);

    let port = (await window.api.store.get('connection.port')) || 9877;

    const connectionResult = await window.api.tron.connect(connectForm.host, port);

    switch (connectionResult) {
      case ConnectionStatus.Connected:
        const [result, err]: [boolean, string | null] = await window.api.tron.authorise(
          (({ program, user, password }) => ({ program, user, password }))(connectForm)
        );
        if (result === true) {
          storeCredentials();
          window.api.window.close(NAME);
        } else {
          setError(err!);
        }
        break;
      case ConnectionStatus.Failed:
        setError('Connection failed');
        break;
      case ConnectionStatus.TimedOut:
        setError('Connection timed out');
        break;
      default:
        window.api.window.close(NAME);
        break;
    }
    setButtonDisabled(false);
  };

  let handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: replace with https://github.com/react-hook-form/react-hook-form
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setConnectForm({ ...connectForm, [name]: value });
  };

  return (
    <Root className={classes.root}>
      {showProgress ? <LinearProgress className={classes.progress} color='secondary' /> : null}
      <Container
        id='container'
        component='div'
        maxWidth='xs'
        sx={{ padding: '0px 24px 24px 24px' }}
      >
        <div className={classes.paper} id='paper'>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon fontSize='large' />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Log in
          </Typography>
          <Typography
            className={classes.error}
            css={{ display: error === undefined ? 'none' : 'initial' }}
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
          </form>
        </div>
      </Container>
    </Root>
  );
}
