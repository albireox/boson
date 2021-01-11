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
  Select,
  Tooltip
} from '@material-ui/core';
import {
  BookOutlined,
  ErrorOutlineOutlined,
  InfoOutlined,
  ReportProblemOutlined
} from '@material-ui/icons';
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonProps
} from '@material-ui/lab';
import React from 'react';
import { ConfigState } from './index';

type MessageLevelButtonsProps = ToggleButtonProps & {
  onConfigUpdate: (newConfig: ConfigState) => void;
};

const MessageLevelButtons: React.FC<MessageLevelButtonsProps> = ({
  onConfigUpdate,
  ...props
}) => {
  const [levels, setLevels] = React.useState(['info', 'warning', 'error']);

  const updateLevels = (newLevels: string[]) => {
    setLevels(newLevels);
    onConfigUpdate({ levels: newLevels });
  };

  React.useEffect(() => {
    updateLevels(levels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

type SelectNumberMessagesProps = FormControlProps & {
  onConfigUpdate: (newConfig: ConfigState) => void;
};

const SelectNumberMessages: React.FC<SelectNumberMessagesProps> = ({
  onConfigUpdate,
  ...props
}) => {
  const [nMessages, setNMessages] = React.useState(10000);

  const updateNMessages = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    setNMessages(event.target.value as number);
    onConfigUpdate({ nMessages: parseInt(event.target.value as string) });
  };

  React.useEffect(() => {
    onConfigUpdate({ nMessages: nMessages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

type MenuBarProps = BoxProps & {
  onConfigUpdate: (newConfig: ConfigState) => void;
};

const MenuBar: React.FC<MenuBarProps> = ({ onConfigUpdate, ...props }) => {
  return (
    <Box {...props}>
      <MessageLevelButtons onConfigUpdate={onConfigUpdate} />
      <SelectNumberMessages
        onConfigUpdate={onConfigUpdate}
        style={{ marginLeft: '8px' }}
      />
    </Box>
  );
};

export default MenuBar;
