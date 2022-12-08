/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import ClearIcon from '@mui/icons-material/Clear';
import UpdateIcon from '@mui/icons-material/Update';
import {
  Badge,
  Button,
  CircularProgress,
  IconButton,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Box, useTheme } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import hal9000logo from './images/hal9000.png';

function PreloadedDesign() {
  const { design_preloaded: designPreloadedKw } = useKeywords('jaeger', [
    'design_preloaded',
  ]);

  const theme = useTheme();

  const [preloaded, setPreloaded] = React.useState<number | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (!designPreloadedKw) return;
    setPreloaded(designPreloadedKw.values[0]);
  }, [designPreloadedKw]);

  if (!preloaded || preloaded < 0) return null;

  return (
    <Stack
      direction='row'
      flexGrow={1}
      sx={{
        bgcolor: `${theme.palette.primary[theme.palette.mode]}`,
        mb: 1,
        p: 1,
      }}
    >
      <Typography variant='subtitle1' alignSelf='center' color='#fff' ml={1}>
        Design {preloaded} has been preloaded.
      </Typography>
      <Stack flexGrow={1} />
      <Button
        variant='outlined'
        size='small'
        sx={{
          '&.MuiButton-root': {
            color: '#fff',
            border: `1px solid #fff`,
          },
        }}
        onClick={() =>
          window.electron.tron.send(
            'jaeger configuration load --from-preloaded'
          )
        }
      >
        Load
      </Button>
      <IconButton
        sx={{ ml: 1 }}
        size='small'
        disableRipple
        onClick={() =>
          window.electron.tron.send('jaeger configuration preload --clear')
        }
      >
        <ClearIcon fontSize='inherit' />
      </IconButton>
    </Stack>
  );
}

function DesignInput() {
  const keywords = useKeywords('jaeger', ['configuration_loaded']);

  const [configurationID, setConfigurationID] = React.useState(-999);
  const [designID, setDesignID] = React.useState(-999);
  const [fieldID, setFieldID] = React.useState(-999);
  const [cloned, setCloned] = React.useState(-999);

  const [value, setValue] = React.useState('<none>');
  const [error, setError] = React.useState(false);

  const [color, setColor] = React.useState('text.primary');

  const [loading, setLoading] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  // This is a ref to an empty and hidden textarea that we use to easily steal the focus from
  // the design input.
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const { configuration_loaded: configurationLoaded } = keywords;

    if (!configurationLoaded) return;

    setConfigurationID(configurationLoaded.values[0]);
    setDesignID(configurationLoaded.values[1]);
    setFieldID(configurationLoaded.values[2]);
    setCloned(configurationLoaded.values[9]);
  }, [keywords]);

  const updateValue = React.useCallback(() => {
    if (designID !== undefined) {
      setValue(designID.toString());
    } else {
      setValue('<none>');
    }
  }, [designID]);

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
      const newDesign = Number.parseFloat(value);
      if (Number.isInteger(newDesign)) {
        setLoading(true);
        window.electron.tron
          .send(`jaeger configuration load ${newDesign}`, true)
          .catch(() => setError(true))
          .finally(() => setLoading(false));
      }
    }
  };

  const loadFromQueue = () => {
    setLoading(true);
    window.electron.tron
      .send('jaeger configuration preload', true)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  return (
    <Stack
      direction='row'
      spacing={0}
      pl={3}
      flexGrow={1}
      sx={{ placeItems: 'center' }}
    >
      <Stack direction='column'>
        <Stack direction='row'>
          <Typography
            sx={{ mr: 1 }}
            variant='h5'
            color='text.primary'
            alignSelf='center'
          >
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
                  color: focused ? 'text.primary' : color,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: focused ? 'solid' : 'hidden',
                },
              }}
              value={value}
              onKeyPress={handleKeyDown}
              onFocus={(e) => {
                if (!loading) {
                  if (value === '<none>') {
                    setValue('');
                  } else {
                    setValue(designID ? designID.toString() : '');
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
        <Typography variant='h5' paddingTop={0.5} color='text.primary'>
          {configurationID ? `Configuration ${configurationID}` : ''}
        </Typography>
        <Typography variant='h5' paddingTop={0.5} color='text.primary'>
          {fieldID ? `Field ${fieldID}` : ''}
        </Typography>
      </Stack>

      <textarea
        ref={ref}
        style={{ visibility: 'hidden', width: '0px', border: '0px' }}
      />

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

export default function Header() {
  return (
    <Box pt={2}>
      <PreloadedDesign />
      <Stack direction='row' px={2} pb={1} pt={1} width='100%'>
        <img
          src={hal9000logo}
          style={{ paddingTop: 10 }}
          height='80px'
          alt='HAL9000 logo'
        />
        <DesignInput />
      </Stack>
    </Box>
  );
}
