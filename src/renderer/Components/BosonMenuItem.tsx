/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: BosonMenuItem.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  Checkbox,
  CheckboxProps,
  MenuItem,
  MenuItemProps,
  Radio,
  RadioProps,
  Stack,
  styled,
  Typography,
  TypographyProps,
} from '@mui/material';
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

export interface BosonMenuItemProps extends MenuItemProps {
  text?: string;
  value?: string | number | readonly string[] | undefined;
  textAlign?: string;
  fontVariant?: TypographyProps['variant'];
  onSelect?: (
    value: unknown,
    event?: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => void;
  endAdornment?: JSX.Element;
}
export type Ref = HTMLLIElement;

const BosonMenuItem = React.forwardRef<Ref, BosonMenuItemProps>(
  (props, ref) => {
    const {
      children,
      value,
      text,
      endAdornment,
      fontVariant = 'body2',
      onSelect = () => {},
      textAlign,
      ...rest
    } = props;

    return (
      <MenuItem
        ref={ref}
        value={value}
        id={text}
        disableRipple
        disableTouchRipple
        onClick={(event) => onSelect(value ?? text, event)}
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
        {...rest}
      >
        {children ?? (
          <Stack direction='row' width='100%'>
            <Typography variant={fontVariant} width='100%'>
              {text}
            </Typography>
            {endAdornment && (
              <>
                <Box flexGrow={1} minWidth={25} /> {endAdornment}
              </>
            )}
          </Stack>
        )}
      </MenuItem>
    );
  }
);

export { BosonMenuItemCheckbox, BosonMenuItemRadio };
export default BosonMenuItem;
