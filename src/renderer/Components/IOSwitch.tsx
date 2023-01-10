/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-15
 *  @Filename: IOSwitch.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable react/jsx-props-no-spreading */

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { Switch, SwitchProps } from '@mui/material';

interface IOSSwitchProps extends SwitchProps {
  color?: 'success' | 'warning' | 'error';
  disabledColor?: 'default' | 'error' | 'success' | 'warning';
}

export default function IOSSwitch(props: IOSSwitchProps) {
  const { color = 'success', disabledColor = 'default', ...otherProps } = props;

  return (
    <Switch
      disableRipple
      icon={
        <ClearIcon
          sx={(theme) => ({
            color:
              disabledColor === 'default'
                ? theme.palette.background.default
                : theme.palette[disabledColor][theme.palette.mode],
          })}
        />
      }
      checkedIcon={
        <CheckIcon
          sx={(theme) => ({
            color: theme.palette[color][theme.palette.mode],
          })}
        />
      }
      sx={(theme) => ({
        width: 42,
        height: 26,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: '2.5px',
          transitionDuration: '300ms',
          backgroundColor: theme.palette.action.active,
          '&.Mui-checked': {
            backgroundColor: theme.palette.mode === 'light' && 'white',
            transform: 'translateX(16px)',
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette[color][theme.palette.mode],
              opacity: 1,
              border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.5,
            },
            '&:hover': {
              backgroundColor: 'white',
            },
          },
          '&:hover': {
            backgroundColor: theme.palette.action.active,
          },
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
          color:
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[600],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
        '& .MuiSwitch-track': {
          borderRadius: `${26 / 2}px`,
          backgroundColor:
            disabledColor === 'default'
              ? theme.palette.action.disabledBackground
              : theme.palette[disabledColor][theme.palette.mode],
          opacity: 1,
          transition: theme.transitions.create(['background-color'], {
            duration: 500,
          }),
        },
      })}
      {...otherProps}
    />
  );
}
