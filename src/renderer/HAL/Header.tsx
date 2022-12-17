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
import { useKeywordContext } from 'renderer/hooks';
import hal9000logo from './images/hal9000.png';

function PreloadedDesign() {
  const {
    'jaeger.design_preloaded': designPreloadedKw,
    'jaeger.preloaded_is_cloned': preloadedIsClonedKw,
  } = useKeywordContext();

  const theme = useTheme();

  const [preloaded, setPreloaded] = React.useState<number | undefined>(
    undefined
  );

  const [clonedText, setClonedText] = React.useState('');

  React.useEffect(() => {
    if (!designPreloadedKw) return;
    setPreloaded(designPreloadedKw.values[0]);
  }, [designPreloadedKw]);

  React.useEffect(() => {
    if (!preloadedIsClonedKw) return;

    if (preloadedIsClonedKw.values[0]) {
      setClonedText(' (CLONED)');
    } else {
      setClonedText('');
    }
  }, [preloadedIsClonedKw]);

  if (!preloaded || preloaded < 0) return null;

  return (
    <Stack
      direction='row'
      flexGrow={1}
      sx={{
        bgcolor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
        mt: -2,
        mb: 1,
        p: 1,
      }}
    >
      <Typography
        fontSize={16}
        fontWeight={400}
        textAlign='center'
        alignSelf='end'
        color='#fff'
        ml={1}
        flexGrow={1}
      >
        Design {preloaded}
        {clonedText} has been preloaded.
      </Typography>
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
  const keywords = useKeywordContext();

  const [configurationID, setConfigurationID] = React.useState(-999);
  const [designID, setDesignID] = React.useState(-999);
  const [fieldID, setFieldID] = React.useState(-999);
  const [cloned, setCloned] = React.useState(false);

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

      <Box ml={1} alignSelf='left'>
        {loading ? (
          <CircularProgress sx={{ ml: 2 }} size={40} />
        ) : (
          <Tooltip title='Preload from queue'>
            <IconButton
              size='medium'
              onClick={loadFromQueue}
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: 'unset',
                  color: theme.palette.text.primary,
                },
              })}
              disableFocusRipple
              disableRipple
              disableTouchRipple
            >
              <UpdateIcon fontSize='large' />
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
      <Stack direction='row' pl={10} pr={4} pb={1} pt={1} width='100%'>
        <DesignInput />
        <Box flexGrow={1} />
        <img
          src={hal9000logo}
          style={{ paddingTop: 10 }}
          height='80px'
          alt='HAL9000 logo'
        />
      </Stack>
    </Box>
  );
}
