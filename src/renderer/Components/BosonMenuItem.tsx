/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: BosonMenuItem.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Checkbox,
  CheckboxProps,
  MenuItem,
  Radio,
  RadioProps,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

const BosonMenuItemCheckbox = styled((props: CheckboxProps) => (
  <Checkbox
    size='small'
    disableFocusRipple
    disableRipple
    disableTouchRipple
    {...props}
  />
))(({ theme }) => ({
  padding: '0px',
  '&.Mui-checked': {
    color: theme.palette.mode === 'dark' ? '#4653C4' : '#4756BD',
  },
  '&.Mui-checked:hover': {
    color: theme.palette.text.primary,
  },
}));

const BosonMenuItemRadio = styled((props: RadioProps) => (
  <Radio
    size='small'
    disableFocusRipple
    disableRipple
    disableTouchRipple
    {...props}
  />
))(({ theme }) => ({
  padding: '0px',
  '&.Mui-checked': {
    color: theme.palette.mode === 'dark' ? '#4653C4' : '#4756BD',
  },
  '&.Mui-checked:hover': {
    color: theme.palette.text.primary,
  },
}));

export interface BosonMenuItemProps {
  text: string;
  selected?: boolean;
  textAlign?: string;
  onClick?: (
    text: string,
    event?: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => void;
  endAdornment?: JSX.Element;
}

export default function BosonMenuItem(props: BosonMenuItemProps) {
  const {
    text,
    onClick,
    endAdornment,
    selected = false,
    textAlign,
    ...rest
  } = props;

  return (
    <MenuItem
      {...rest}
      selected={selected}
      id={text}
      disableRipple
      disableTouchRipple
      onClick={(event) => (onClick ? onClick(text, event) : undefined)}
      sx={(theme) => {
        const bgColor = theme.palette.mode === 'dark' ? '#4653C4' : '#4756BD';
        return {
          px: '12px',
          textAlign: textAlign ?? (!endAdornment ? 'center' : 'inherit'),
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
        {endAdornment && (
          <>
            <Box flexGrow={1} minWidth={25} /> {endAdornment}
          </>
        )}
      </Stack>
    </MenuItem>
  );
}

export { BosonMenuItemCheckbox, BosonMenuItemRadio };
