/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: menubar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  BoxProps,
  FormControl,
  FormControlProps,
  IconButton,
  InputAdornment,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  TextFieldProps,
  Theme,
  Tooltip,
  useTheme
} from '@material-ui/core';
import {
  BookOutlined,
  ErrorOutlineOutlined,
  InfoOutlined,
  Refresh,
  ReportProblemOutlined
} from '@material-ui/icons';
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonProps
} from '@material-ui/lab';
import React from 'react';
import { ConfigContext, ConfigState } from './index';

// Message level
type MessageLevelButtonsProps = ToggleButtonProps & {
  onConfigUpdate: (newConfig: ConfigState) => void;
};

const MessageLevelButtons: React.FC<MessageLevelButtonsProps> = ({
  onConfigUpdate,
  ...props
}) => {
  const config = React.useContext(ConfigContext);
  const [levels, setLevels] = React.useState(config.levels);

  const updateLevels = (newLevels: string[]) => {
    setLevels(newLevels);
    onConfigUpdate({ levels: newLevels });
  };

  return (
    <ToggleButtonGroup
      size='small'
      value={levels}
      onChange={(event, newLevels: string[]) => updateLevels(newLevels)}
    >
      <ToggleButton value='debug'>
        <Tooltip title='Debug'>
          <BookOutlined />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value='info'>
        <Tooltip title='Info'>
          <InfoOutlined />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value='warning'>
        <Tooltip title='Warning'>
          <ReportProblemOutlined />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value='error'>
        <Tooltip title='Error'>
          <ErrorOutlineOutlined />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

// Selected actors
type SelectActorsProps = TextFieldProps & {
  onConfigUpdate: (newConfig: ConfigState) => void;
};

const SelectActors: React.FC<SelectActorsProps> = ({
  onConfigUpdate,
  ...props
}) => {
  const config = React.useContext(ConfigContext);
  const theme = useTheme();

  const [actors, setActors] = React.useState(
    config.selectedActors && config.selectedActors.length > 0
      ? config.selectedActors
      : ['all']
  );

  const updateActors = (event: React.ChangeEvent<{ value: unknown }>) => {
    let selected = event.target.value as string[];
    if (selected.length === 0) {
      setActors(['all']);
      onConfigUpdate({ selectedActors: [] });
    } else {
      let filtered = selected.filter((x) => x !== 'all');
      setActors(filtered);
      onConfigUpdate({ selectedActors: filtered });
    }
  };

  const reset = () => {
    setActors(['all']);
    onConfigUpdate({ selectedActors: [] });
  };

  const getStyles = (name: string, actors: string[], theme: Theme) => {
    return {
      fontWeight:
        actors.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
      color:
        actors.indexOf(name) === -1
          ? theme.palette.text.primary
          : theme.palette.secondary.main,
      backgroundColor: 'transparent'
    };
  };

  return (
    <TextField
      {...props}
      select
      value={actors}
      onChange={updateActors}
      variant='outlined'
      size='small'
      SelectProps={{ multiple: true }}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <IconButton
              disableFocusRipple
              disableRipple
              size='small'
              onClick={reset}
              onMouseDown={reset}
            >
              {<Refresh />}
            </IconButton>
          </InputAdornment>
        )
      }}
    >
      {
        <MenuItem key='all' value='all' disabled>
          All
        </MenuItem>
      }
      {config.seenActors?.map((actor) => (
        <MenuItem
          key={actor}
          value={actor}
          style={getStyles(actor, actors, theme)}
        >
          {actor}
        </MenuItem>
      ))}
    </TextField>
  );
};

// Number of messages
type SelectNumberMessagesProps = FormControlProps & {
  onConfigUpdate: (newConfig: ConfigState) => void;
};

const SelectNumberMessages: React.FC<SelectNumberMessagesProps> = ({
  onConfigUpdate,
  ...props
}) => {
  const config = React.useContext(ConfigContext);
  const [nMessages, setNMessages] = React.useState(config.nMessages);

  const updateNMessages = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    setNMessages(event.target.value as number);
    onConfigUpdate({ nMessages: parseInt(event.target.value as string) });
  };

  return (
    <Tooltip title='Number of messages'>
      <FormControl variant='outlined' size='small' {...props}>
        <Select
          native
          value={nMessages}
          onChange={updateNMessages}
          labelWidth={0}
        >
          <option value={1000}>1,000</option>
          <option value={10000}>10,000</option>
          <option value={100000}>100,000</option>
          <option value={0}>Unlimited</option>
        </Select>
      </FormControl>
    </Tooltip>
  );
};

const useStyles = makeStyles((theme) => ({
  selectNumber: {
    marginLeft: '16px',
    maxWidth: '110px'
  },
  selectActors: {
    marginLeft: '8px',
    minWidth: '100px',
    maxWidth: '200px',
    '& .MuiSelect-select': {
      background: 'transparent' // Disable selected background
    }
  }
}));

// Menu bar
type MenuBarProps = BoxProps & {
  onConfigUpdate: (newConfig: ConfigState) => void;
};

const MenuBar: React.FC<MenuBarProps> = ({ onConfigUpdate, ...props }) => {
  const classes = useStyles();

  return (
    <Box {...props}>
      <MessageLevelButtons onConfigUpdate={onConfigUpdate} />
      <SelectActors
        onConfigUpdate={onConfigUpdate}
        className={classes.selectActors}
      />
      <SelectNumberMessages
        onConfigUpdate={onConfigUpdate}
        className={classes.selectNumber}
      />
    </Box>
  );
};

export default MenuBar;
