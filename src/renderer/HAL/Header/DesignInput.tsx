/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-08
 *  @Filename: DesignInput.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import UpdateIcon from '@mui/icons-material/Update';
import {
  Badge,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useKeywordContext } from 'renderer/hooks';

interface LoadFromQueueProps {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  setError: (isError: boolean) => void;
}

function LoadFromQueue(props: LoadFromQueueProps) {
  const { loading, setLoading, setError } = props;

  const loadFromQueue = React.useCallback(() => {
    setLoading(true);
    window.electron.tron
      .send('jaeger configuration preload', true)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [setLoading, setError]);

  const Progress = <CircularProgress sx={{ ml: 2 }} size={40} />;
  const LoadButton = (
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
  );

  return (
    <Box ml={1} alignSelf='left'>
      {loading ? Progress : LoadButton}
    </Box>
  );
}

export function DesignInput() {
  const keywords = useKeywordContext();
  const { configuration_loaded: configurationLoaded } = keywords;

  const [configurationID, setConfigurationID] = React.useState(-999);
  const [designID, setDesignID] = React.useState(-999);
  const [fieldID, setFieldID] = React.useState(-999);
  const [cloned, setCloned] = React.useState(false);

  const [inputValue, setInputValue] = React.useState('');

  const [color, setColor] = React.useState('text.primary');
  const [focused, setFocused] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!configurationLoaded) return;

    setConfigurationID(configurationLoaded.values[0]);
    setDesignID(configurationLoaded.values[1]);
    setFieldID(configurationLoaded.values[2]);
    setCloned(configurationLoaded.values[9]);

    setFocused(false);
    setInputValue(configurationLoaded.values[1]);
  }, [configurationLoaded]);

  React.useEffect(() => {
    if (error) {
      setColor('error.main');
    } else if (configurationID < 0) {
      setColor('warning.main');
    } else {
      setColor('text.primary');
    }
  }, [configurationID, error]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const newDesign = Number.parseFloat(inputValue);
      if (Number.isInteger(newDesign)) {
        setLoading(true);
        window.electron.tron
          .send(`jaeger configuration load ${newDesign}`, true)
          .catch(() => setError(true))
          .finally(() => setLoading(false));
      }
    }
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
            invisible={!cloned || focused}
            sx={{ '.MuiBadge-badge': { right: '-24px' } }}
          >
            <Box
              component='span'
              fontSize={focused ? '18px' : '21px'}
              color={focused ? 'text.primary' : color}
              padding={focused ? '2px 8px' : '0px'}
              contentEditable
              suppressContentEditableWarning
              onKeyPress={handleKeyDown}
              onFocus={() => {
                setInputValue(designID.toString());
                setFocused(true);
              }}
              onBlur={(e) => {
                if (!loading) {
                  setFocused(false);
                } else {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setInputValue(e.currentTarget.textContent ?? '')}
            >
              {focused ? inputValue : designID}
            </Box>
          </Badge>
        </Stack>
        <Typography variant='h5' paddingTop={0.5} color='text.primary'>
          {configurationID ? `Configuration ${configurationID}` : ''}
        </Typography>
        <Typography variant='h5' paddingTop={0.5} color='text.primary'>
          {fieldID ? `Field ${fieldID}` : ''}
        </Typography>
      </Stack>
      <LoadFromQueue
        loading={loading}
        setLoading={setLoading}
        setError={setError}
      />
    </Stack>
  );
}
