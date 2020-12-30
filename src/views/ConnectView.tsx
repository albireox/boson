/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-22
 *  @Filename: ConnectView.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { LinearProgress } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import React, { SyntheticEvent, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  progress: {
    width: '100vw',
    padding: '0px',
    marginLeft: '-16px',
    float: 'none',
    height: '2px'
  },
  paper: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
    padding: theme.spacing(0),
    '& > div': {
      margin: theme.spacing(0.5, 0)
    }
  },
  submit: {
    margin: theme.spacing(3, 0, 0)
  },
  error: {
    backgroundColor: theme.palette.secondary.main,
    marginTop: theme.spacing(3),
    padding: theme.spacing(1),
    width: '100%',
    textAlign: 'center'
  }
}));

export default function ConnectView() {
  const NAME = 'connect';
  const classes = useStyles();

  const [connectForm, setConnectForm] = useState<{ [key: string]: any }>({
    program: null,
    user: null,
    password: null,
    remember: true
  });
  const [error, setError] = useState<undefined | string>(undefined);
  const [buttonDisabled, setButtonDisabled] = useState<undefined | boolean>(false);
  const [showProgress, setShowProgress] = useState<boolean>(false);

  React.useEffect(() => {
    if (error !== undefined) {
      window.api.invoke(
        'window-set-size',
        NAME,
        document.getElementById('root')?.scrollWidth as number,
        (document.getElementById('paper')?.scrollHeight as number) + 60
      );
      setButtonDisabled(false);
      setShowProgress(false);
    }
  }, [error]);

  let handleConnect = async (event: SyntheticEvent) => {
    event.preventDefault();
    setButtonDisabled(true);
    setShowProgress(true);

    const connectionResult = await window.api.invoke('tron-connect', 'localhost', 9877);

    switch (connectionResult) {
      case window.api.tron.ConnectionStatus.Connected:
        try {
          await window.api.invoke(
            'tron-authorise',
            (({ program, user, password }) => ({ program, user, password }))(connectForm)
          );
          window.api.invoke('window-close', NAME);
        } catch (error) {
          setError(error.message);
          break;
        }
        break;
      case window.api.tron.ConnectionStatus.Failed:
        setError('Connection failed');
        break;
      case window.api.tron.ConnectionStatus.TimedOut:
        setError('Connection timed out');
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
    <Container component='div' maxWidth='xs'>
      {showProgress ? <LinearProgress className={classes.progress} color='secondary' /> : null}
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
        <form className={classes.form} noValidate onSubmit={handleConnect} autoComplete='off'>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='program'
            label='Program'
            name='program'
            onChange={handleChange}
            autoFocus
            size='small'
            InputLabelProps={{ required: false }}
          />
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='user'
            label='Username'
            id='user'
            onChange={handleChange}
            size='small'
            InputLabelProps={{ required: false }}
          />
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type='password'
            onChange={handleChange}
            id='password'
            size='small'
            InputLabelProps={{ required: false }}
          />
          <FormControlLabel
            label='Remember password'
            control={<Checkbox name='remember' checked color='primary' onChange={handleChange} />}
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
  );
}
