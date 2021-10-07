/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-01
 *  @Filename: validatedInput.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  InputAdornment,
  TextField,
  TextFieldProps,
  Theme
} from '@mui/material';
import { SxProps } from '@mui/system';
import React from 'react';

/** @jsxImportSource @emotion/react */

type ValidatedNumberInputProps = Omit<TextFieldProps, 'onChange'> & {
  onChange?: (arg0: number | undefined) => any;
  startAdornment?: string | React.ReactNode;
  endAdornment?: string | React.ReactNode;
};

export const ValidatedNumberInput: React.FC<ValidatedNumberInputProps> = ({
  value = 0,
  onChange = null,
  startAdornment = undefined,
  endAdornment = undefined,
  ...props
}) => {
  const [error, setError] = React.useState(false);

  const validateChange = (value: string) => {
    const test: Number = Number(value);

    if (Number.isNaN(test)) {
      setError(true);
    } else {
      setError(false);
    }

    if (onChange) {
      if (value === '' || Number.isNaN(test)) {
        onChange(undefined);
      } else {
        onChange(test.valueOf());
      }
    }
  };

  const sx: SxProps<Theme> = {
    ...{ '.MuiInputBase-input': { textAlign: 'right' } },
    ...props.sx
  };
  props.sx = sx;

  return (
    <TextField
      error={error}
      onChange={(e) => {
        validateChange(e.target.value);
      }}
      size={props.size || 'small'}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position='start'>{startAdornment}</InputAdornment>
        ) : null,
        endAdornment: endAdornment ? (
          <InputAdornment position='end'>{endAdornment}</InputAdornment>
        ) : null
      }}
      {...props}
    />
  );
};
