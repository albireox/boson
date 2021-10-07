/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: input.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SendIcon from '@mui/icons-material/Send';
import { Box, IconButton, InputAdornment, OutlinedInput, TextFieldProps } from '@mui/material';
import * as React from 'react';
import { SyntheticEvent } from 'react';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'row',
    padding: '4px 8px 8px'
  },
  commandInput: {
    height: '40px'
  }
} as const;

const CommandInput: React.FC<TextFieldProps> = (props) => {
  const commandRef = React.useRef<any>(null);
  const [error, setError] = React.useState(false);

  const handleCommand = (event: SyntheticEvent) => {
    event.preventDefault();

    let value = commandRef.current.firstChild.value.trim();

    if (value.length > 0) {
      window.api.invoke('tron-send-command', value);
      commandRef.current.firstChild.value = '';
    } else {
      setError(true);
    }
  };

  return (
    <Box sx={styles.root}>
      <form onSubmit={handleCommand} autoComplete='off' noValidate style={{ width: '100%' }}>
        <OutlinedInput
          error={error}
          onChange={() => setError(false)}
          sx={styles.commandInput}
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
