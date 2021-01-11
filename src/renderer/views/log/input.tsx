/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: input.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, TextField, TextFieldProps } from '@material-ui/core';
import React from 'react';

const CommandInput: React.FC<TextFieldProps> = (props) => {
  return (
    <Box>
      <TextField
        variant='outlined'
        margin='none'
        fullWidth
        id='command'
        label=''
        name='command'
        autoFocus
        size='small'
        style={{ padding: '4px 8px 8px' }}
      />
    </Box>
  );
};

export default CommandInput;
