/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import UpdateIcon from '@mui/icons-material/Update';
import {
  Badge,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { Box, useTheme } from '@mui/system';
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

function PreloadedDesign() {
  const keywords = useKeywords(['jaeger.configuration_loaded', 'jaeger.design_preloaded']);

  let design_id: number | undefined = keywords['jaeger.configuration_loaded']?.values[1];
  let preloaded: number | undefined = keywords['jaeger.design_preloaded']?.values[0];

  const theme = useTheme();

  if (!preloaded || preloaded < 0 || (design_id && design_id === preloaded)) return null;

  return (
    <Stack
      direction='row'
      flexGrow={1}
      sx={{ bgcolor: `${theme.palette.primary[theme.palette.mode]}`, mb: 1, p: 1 }}
    >
      <Typography variant='subtitle1' alignSelf='center' color='#fff' ml={1}>
        Design {preloaded} has been preloaded.
      </Typography>
      <Stack flexGrow={1} />
      <Button
        variant='outlined'
        size='small'
        sx={(theme) => ({
          '&.MuiButton-root': {
            color: '#fff',
            border: `1px solid #fff`
          }
        })}
        onClick={() => window.api.tron.send('jaeger configuration load --from-preloaded')}
      >
        Load
      </Button>
    </Stack>
  );
}

function DesignInput() {
  const keywords = useKeywords(['jaeger.configuration_loaded'], 'configuration-input-loaded');

  let configuration_id: number | undefined = keywords['jaeger.configuration_loaded']?.values[0];
  let design_id: number | undefined = keywords['jaeger.configuration_loaded']?.values[1];
  let field_id: number | undefined = keywords['jaeger.configuration_loaded']?.values[2];

  const configuration_loaded = keywords['jaeger.configuration_loaded'];
  const cloned = configuration_loaded && configuration_loaded.values[9] === 'T';

  const [value, setValue] = React.useState(design_id?.toString() || '<none>');
  const [error, setError] = React.useState(false);

  const [color, setColor] = React.useState('text.primary');

  const [loading, setLoading] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  // This is a ref to an empty and hidden textarea that we use to easily steal the focus from
  // the design input.
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const updateValue = React.useCallback(() => {
    if (design_id !== undefined) {
      setValue(`${design_id}`);
    } else {
      setValue('<none>');
    }
  }, [design_id]);

  React.useEffect(() => {
    updateValue();

    setFocused(false);
    setError(false);
    setLoading(false);

    if (ref.current) ref.current.focus();
  }, [updateValue]);

  React.useEffect(() => {
    if (error) {
      setColor('error.main');
    } else if (value === '<none>') {
      setColor('warning.main');
    } else {
      setColor('text.primary');
    }
  }, [value, error]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const new_design = Number.parseFloat(value);
      if (Number.isInteger(new_design)) {
        setLoading(true);
        window.api.tron
          .send(`jaeger configuration load ${new_design}`, true)
          .catch(() => setError(true))
          .finally(() => setLoading(false));
      }
    }
  };

  const loadFromQueue = () => {
    setLoading(true);
    window.api.tron
      .send('jaeger configuration preload', true)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  return (
    <Stack direction='row' spacing={0} pl={3} flexGrow={1} sx={{ placeItems: 'center' }}>
      <Stack direction='column'>
        <Stack direction='row'>
          <Typography sx={{ mr: 1 }} variant='h5' color='text.primary' alignSelf='center'>
            Design
          </Typography>
          <Badge
            badgeContent='Cloned'
            color='primary'
            invisible={!cloned}
            sx={{ '.MuiBadge-badge': { right: '-4px' } }}
          >
            <OutlinedInput
              error={error}
              sx={{
                '& input': {
                  padding: focused ? '2px 8px' : '0px',
                  width: '80px',
                  typography: 'h5',
                  color: focused ? 'text.primary' : color
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: focused ? 'solid' : 'hidden'
                }
              }}
              value={value}
              onKeyPress={handleKeyDown}
              onFocus={(e) => {
                if (!loading) {
                  if (value === '<none>') {
                    setValue('');
                  } else {
                    setValue(design_id ? design_id.toString() : '');
                  }
                  setFocused(true);
                } else {
                  e.preventDefault();
                }
              }}
              onBlur={(e) => {
                if (!loading) {
                  setFocused(false);
                  updateValue();
                } else {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setValue(e.target.value)}
            />
          </Badge>
        </Stack>
        <Typography variant='h5' paddingTop={0.5}>
          {configuration_id ? `Configuration ${configuration_id}` : ''}
        </Typography>
        <Typography variant='h5' paddingTop={0.5}>
          {field_id ? `Field ${field_id}` : ''}
        </Typography>
      </Stack>

      <textarea ref={ref} style={{ width: '0px', border: '0px' }} />

      <Box ml={3} alignSelf='left'>
        {loading ? (
          <CircularProgress sx={{ ml: 2 }} size={40} />
        ) : (
          <Tooltip title='Preload from queue'>
            <IconButton size='medium' onClick={loadFromQueue}>
              <UpdateIcon fontSize='large' color='primary' />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Stack>
  );
}

export default function HALHeader() {
  return (
    <Box pt={1}>
      <PreloadedDesign />
      <Stack direction='row' px={2} pb={1} pt={1} width='100%'>
        <img src={hal9000logo} height='80px' alt='HAL9000 logo' />
        <DesignInput />
        <div css={{ flexGrow: 1 }} />
        <Box alignSelf='center' pr={3}>
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
    </Box>
  );
}
