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

export default function CommandInput(props: TextFieldProps) {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(false);

  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [history, setHistory] = React.useState<string[]>(['']);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setError(false);
  };

  const handleCommand = () => {
    if (value.length > 0) {
      if (history[1] !== value) {
        setHistory((current) => [current[0], value, ...current.slice(1)]);
      }
      window.api.tron.send(value);
      setValue('');
      setHistoryIndex(0);
    } else {
      setError(true);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCommand();
    } else if (event.key === 'ArrowUp') {
      const newIndex = historyIndex + 1;
      if (history.length >= newIndex + 1) {
        setValue(history[newIndex]);
        setHistoryIndex(newIndex);
      }
    } else if (event.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setValue(history[newIndex]);
        setHistoryIndex(newIndex);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', padding: '4px 8px 8px' }}>
      <OutlinedInput
        error={error}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        sx={{ height: '40px' }}
        value={value}
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
    </Box>
  );
}
