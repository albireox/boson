/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import UpdateIcon from '@mui/icons-material/Update';
import {
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import hal9000logo from './images/hal9000.png';

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName='.Mui-focusVisible' disableRipple {...props} />
))(({ theme }) => ({
  width: 63,
  height: 39,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(24px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
        opacity: 1,
        border: 0
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5
      }
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff'
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3
    }
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 35,
    height: 35
  },
  '& .MuiSwitch-track': {
    borderRadius: 36 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500
    })
  }
}));

function DesignInput() {
  const keywords = useKeywords(['jaeger.configuration_loaded'], 'configuration-input-loaded');

  let configuration_id: number | undefined = keywords['jaeger.configuration_loaded']?.values[0];
  let design_id: number | undefined = keywords['jaeger.configuration_loaded']?.values[1];

  const [preValue, setPreValue] = React.useState(design_id?.toString() || '<none>');
  const [value, setValue] = React.useState(design_id?.toString() || '<none>');
  const [error, setError] = React.useState(false);

  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (design_id !== undefined) {
      setValue(`${design_id} (conf. ${configuration_id})`);
    } else {
      setValue('<none>');
    }
    setFocused(false);
  }, [design_id, configuration_id]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const new_design = Number.parseFloat(value);
      if (Number.isInteger(new_design)) {
        window.api.tron.send(`jaeger configuration load ${new_design}`);
      }
    }
  };

  return (
    <OutlinedInput
      error={error}
      sx={{
        '& input': {
          padding: focused ? '10px 10px' : '0px',
          width: focused ? '80px' : null,
          typography: 'h5',
          color: value === '<none>' ? 'warning.main' : 'text.primary'
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: focused ? 'solid' : 'hidden'
        }
      }}
      endAdornment={
        focused ? (
          <InputAdornment position='end'>
            <IconButton size='small'>
              <UpdateIcon />
            </IconButton>
          </InputAdornment>
        ) : null
      }
      value={value}
      onKeyPress={handleKeyDown}
      onFocus={() => {
        setPreValue(value);
        if (value === '<none>') {
          setValue('');
        } else {
          setValue(design_id ? design_id.toString() : '');
        }
        setFocused(true);
      }}
      onBlur={() => {
        setValue(preValue);
        setFocused(false);
        setError(false);
      }}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export default function HALHeader() {
  return (
    <Stack direction='row'>
      <img src={hal9000logo} height='100px' alt='HAL9000 logo' />
      <Stack direction='row' alignItems='center' pl={4}>
        <Typography sx={{ mr: 1 }} variant='h5' color='text.primary'>
          Design
        </Typography>
        <DesignInput />
      </Stack>
      <div css={{ flexGrow: 1 }} />
      <Box alignSelf='center' pr={2}>
        <FormControl>
          <FormControlLabel
            control={<IOSSwitch />}
            label={
              <Typography sx={{ mr: 1.5 }} variant='h5' color='text.secondary'>
                Auto
              </Typography>
            }
            labelPlacement='start'
          />
        </FormControl>
      </Box>
    </Stack>
  );
}
