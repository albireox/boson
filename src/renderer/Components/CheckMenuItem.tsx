/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: CheckMenuItem.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Checkbox, MenuItem, Stack, Typography } from '@mui/material';

export interface CheckMenuItemProps {
  text: string;
  checked?: boolean;
  onClick?: (
    event: React.MouseEvent<HTMLLIElement | HTMLButtonElement, MouseEvent>,
    text: string
  ) => void;
}

export default function CheckMenuItem(props: CheckMenuItemProps) {
  const { text, onClick, checked } = props;
  return (
    <MenuItem
      {...props}
      id={text}
      disableRipple
      disableTouchRipple
      onClick={(event) => (onClick ? onClick(event, text) : undefined)}
      sx={(theme) => ({
        px: '8px',
        '&:hover': {
          borderRadius: '4%',
          backgroundColor:
            theme.palette.mode === 'dark' ? '#4653C4' : '#4756BD',
          '& > * > .MuiButtonBase-root ': {
            color: theme.palette.text.primary,
          },
        },
      })}
    >
      <Stack direction='row' width='100%'>
        <Typography variant='body2' width='100%'>
          {text}
        </Typography>
        <div style={{ minWidth: '20px', flexGrow: 1 }} />
        <Checkbox
          sx={(theme) => ({
            p: 0,
            '&.Mui-checked': {
              color: theme.palette.mode === 'dark' ? '#4653C4' : '#4756BD',
            },
            '&.Mui-checked:hover': {
              color: theme.palette.text.primary,
            },
          })}
          checked={checked}
          size='small'
          disableFocusRipple
          disableRipple
          disableTouchRipple
          onClick={(event) => (onClick ? onClick(event, text) : undefined)}
        />
      </Stack>
    </MenuItem>
  );
}
