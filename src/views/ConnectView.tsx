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

  let handleConnect = async (event: any) => {
    event.preventDefault();
    if (error === undefined) {
      const windowSize: number[] = await window.electron.ipc.invoke('get-window-size', 'connect');
      await window.electron.ipc.invoke('set-window-size', 'connect',
                                       windowSize[0], windowSize[1] + 60)
    }
    setError('Failed!!!');
  };

  return (
    <Container component='div' maxWidth='xs'>
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon fontSize='large' />
        </Avatar>
        <Typography component='h1' variant='h5'>Log in</Typography>
        <Typography className={classes.error}
          style={{display: error === undefined ? 'none' : 'initial'}}
          component='h5'>{error}</Typography>
        <form className={classes.form} onSubmit={handleConnect}>
          <TextField variant='outlined' margin='normal' required
            fullWidth id='program' label='Program' name='program'
            autoComplete="off" autoFocus size='small'
            InputLabelProps={{ required: false }} />
          <TextField variant='outlined' margin='normal' required
            fullWidth name='user' label='Username' type='user'
            id='user' autoComplete='off'  size='small'
            InputLabelProps={{ required: false }} />
          <TextField variant='outlined' margin='normal' required
            fullWidth name='password' label='Password' type='password'
            id='password' autoComplete='off'  size='small'
            InputLabelProps={{ required: false }} />
          <FormControlLabel
            control={<Checkbox value='remember' color='primary' />}
            label='Remember password' />
          <Button type='submit' fullWidth variant='contained' color='primary'
            className={classes.submit}>
              Connect
          </Button>
        </form>
      </div>
    </Container>
  );
}
