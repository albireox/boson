/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: input.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  IconButton,
  InputAdornment,
  makeStyles,
  OutlinedInput,
  TextFieldProps
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import React, { SyntheticEvent } from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    padding: '4px 8px 8px'
  },
  commandInput: {
    height: '40px'
  }
}));

const CommandInput: React.FC<TextFieldProps> = (props) => {
  const classes = useStyles();
  const commandRef = React.useRef<any>(null);

  const handleCommand = (event: SyntheticEvent) => {
    event.preventDefault();

    window.api.invoke(
      'tron-send-command',
      commandRef.current.firstChild.value
    );

    commandRef.current.firstChild.value = '';
  };

  return (
    <Box className={classes.root}>
      <form
        onSubmit={handleCommand}
        autoComplete='off'
        style={{ width: '100%' }}
      >
        <OutlinedInput
          className={classes.commandInput}
          ref={commandRef}
          fullWidth
          margin='none'
          id='command'
          name='command'
          autoFocus
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                color='primary'
                disableFocusRipple
                disableRipple
                size='small'
                onClick={handleCommand}
                onMouseDown={handleCommand}
              >
                {<SendIcon />}
              </IconButton>
            </InputAdornment>
          }
        />
      </form>
    </Box>
  );
};

export default CommandInput;
