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
  showBackground?: boolean;
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
      showBackground = true,
      onSelect,
      textAlign,
      ...rest
    } = props;

    let extraProps = {};
    if (onSelect) {
      extraProps = {
        onClick: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) =>
          onSelect(value ?? text, event),
      };
    }

    return (
      <MenuItem
        ref={ref}
        value={value}
        id={text}
        disableRipple
        disableTouchRipple
        sx={(theme) => {
          const bgColor = theme.palette.mode === 'dark' ? '#4653C4' : '#4756BD';
          return {
            px: '12px',
            textAlign: textAlign ?? (!endAdornment ? 'center' : 'inherit'),
            '&.Mui-focusVisible': {
              backgroundColor: 'transparent',
            },
            '&.Mui-selected:hover': {
              backgroundColor: bgColor,
            },
            '&.Mui-selected,&.Mui-selected.Mui-focusVisible': {
              backgroundColor: showBackground ? bgColor : 'transparent',
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
        {...extraProps}
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
