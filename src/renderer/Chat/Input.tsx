/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-21
 *  @Filename: Input.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  IconButton,
  IconButtonProps,
  InputAdornment,
  OutlinedInput,
  styled,
} from '@mui/material';
import React from 'react';

const AdornmentIconButton = styled((props: IconButtonProps) => (
  <IconButton
    disableFocusRipple
    disableRipple
    disableTouchRipple
    size='small'
    {...props}
  />
))(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': { color: theme.palette.text.primary },
}));

export default function Input() {
  const [value, setValue] = React.useState('');

  const sendCommand = React.useCallback(() => {
    window.electron.tron.send(`msg ${value}`).catch(() => {});
    setValue('');
  }, [value]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    []
  );

  return (
    <Box display='flex' flexDirection='row' px={2} pb={2}>
      <OutlinedInput
        onChange={handleChange}
        onKeyDown={(event) => event.key === 'Enter' && sendCommand()}
        sx={(theme) => ({
          height: '40px',
          backgroundColor: theme.palette.action.boxBackground,
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        })}
        value={value}
        fullWidth
        margin='none'
        autoFocus
        placeholder='Message'
        endAdornment={
          <InputAdornment position='end'>
            <AdornmentIconButton
              onClick={sendCommand}
              onMouseDown={sendCommand}
            >
              <SendIcon />
            </AdornmentIconButton>
          </InputAdornment>
        }
      />
    </Box>
  );
}
