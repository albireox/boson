/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-11
 *  @Filename: ExposureTimeInput.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { InputAdornment, TextField } from '@mui/material';

export type ExposureTimeInputType = {
  label: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ExposureTimeInput = ({
  label,
  value,
  onChange,
}: ExposureTimeInputType) => (
  <TextField
    label={label}
    size='small'
    type='number'
    InputProps={{
      endAdornment: <InputAdornment position='end'>s</InputAdornment>,
    }}
    variant='standard'
    value={value}
    onChange={onChange}
    InputLabelProps={{
      shrink: true,
    }}
    sx={{
      width: '80px',
      '& .MuiInputBase-root': { marginTop: 1 },
    }}
  />
);