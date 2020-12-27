/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-22
 *  @Filename: ConnectView.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import React, { useState } from 'react';


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
    padding: theme.spacing(0),
    '& > div': {
      margin: theme.spacing(0.5)
    }
  },
  submit: {
    margin: theme.spacing(3, 0, 0),
  },
  error: {
    backgroundColor: theme.palette.secondary.main,
    marginTop: theme.spacing(3),
    padding: theme.spacing(1),
    width: '100%',
    textAlign: 'center',
  }
}));


export default function ConnectView() {
  const classes = useStyles();

  const [error, setError] = useState<undefined | string>(undefined);
  const [buttonDisabled, setButtonDisabled] = useState<undefined | boolean>(false);

  let handleConnect = async (event: any) => {

    event.preventDefault();

    setButtonDisabled(true);

    let erred = false;
    const connectionResult = await window.api.invoke('tron-connect', 'localhost', 6093)

    switch (connectionResult) {
      case window.api.tron.ConnectionStatusEnum.Connected:
        break;
      case window.api.tron.ConnectionStatusEnum.Failed:
        setError('Connection failed')
        erred = true;  // setError is async so error can still be undefined.
        setButtonDisabled(false);
        break
      case window.api.tron.ConnectionStatusEnum.TimedOut:
        setError('Connection timed out')
        erred = true;
        setButtonDisabled(false);
        break
    }

    if (erred && error === undefined) {
      const windowSize: number[] = await window.api.invoke('get-window-size', 'connect');
      await window.api.invoke('set-window-size', 'connect',
        windowSize[0], windowSize[1] + 60)
    }
  };

  return (
    <Container component='div' maxWidth='xs'>
      <div className={classes.paper}>
        <Avatar className={classes.avatar}><LockOutlinedIcon fontSize='large' /></Avatar>
        <Typography component='h1' variant='h5'>Log in</Typography>
        <Typography className={classes.error}
          style={{ display: error === undefined ? 'none' : 'initial' }}
          component='h5'>{error}</Typography>
        <form className={classes.form} noValidate onSubmit={handleConnect} autoComplete='off'>
          <TextField variant='outlined' margin='normal' required
            fullWidth id='program' label='Program' name='program'
            autoFocus size='small' InputLabelProps={{ required: false }} />
          <TextField variant='outlined' margin='normal' required
            fullWidth name='user' label='Username' id='user'
            size='small' InputLabelProps={{ required: false }} />
          <TextField variant='outlined' margin='normal' required
            fullWidth name='password' label='Password' type='password'
            id='password' size='small' InputLabelProps={{ required: false }} />
          <FormControlLabel label='Remember password'
            control={<Checkbox value='remember' color='primary' />} />
          <Button type='submit' fullWidth variant='contained' color='primary'
            className={classes.submit} disabled={buttonDisabled}>
            Connect
          </Button>
        </form>
      </div>
    </Container>
  );
}
