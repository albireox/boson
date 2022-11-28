/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: CheckMenuItem.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Checkbox, MenuItem, Stack, Typography } from '@mui/material';
import React from 'react';

export interface CheckMenuItemProps {
  text: string;
  noCheckbox?: boolean;
  checked?: boolean;
  selected?: boolean;
  textAlign?: string;
  onClick?: (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    text: string
  ) => void;
}

export default function CheckMenuItem(props: CheckMenuItemProps) {
  const { text, onClick, checked, noCheckbox, selected, textAlign, ...rest } =
    props;

  return (
    <MenuItem
      {...rest}
      selected={selected}
      id={text}
      disableRipple
      disableTouchRipple
      onClick={(event) => (onClick ? onClick(event, text) : undefined)}
      sx={(theme) => {
        const bgColor = theme.palette.mode === 'dark' ? '#4653C4' : '#4756BD';

        return {
          px: '8px',
          textAlign: textAlign ?? (noCheckbox ? 'center' : 'inherit'),
          '&.Mui-focusVisible': {
            backgroundColor: 'transparent',
          },
          '&.Mui-selected,&.Mui-selected:hover,&.Mui-selected.Mui-focusVisible':
            {
              backgroundColor: bgColor,
            },
          '&:hover': {
            borderRadius: '4%',
            backgroundColor: bgColor,
            '& > * > .MuiButtonBase-root ': {
              color: theme.palette.text.primary,
            },
          },
        };
      }}
    >
      <Stack direction='row' width='100%'>
        <Typography variant='body2' width='100%'>
          {text}
        </Typography>
        {!noCheckbox && (
          <>
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
            />
          </>
        )}
      </Stack>
    </MenuItem>
  );
}
