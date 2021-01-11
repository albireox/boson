/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: menubar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, BoxProps, Tooltip } from '@material-ui/core';
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

const MessageLevelButtons: React.FC<MessageLevelButtonsProps> = (props) => {
  const [levels, setLevels] = React.useState(['info', 'warning', 'error']);

  const updateLevels = (newLevels: string[]) => {
    setLevels(newLevels);
    props.onConfigUpdate({ levels: newLevels });
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

type MenuBarProps = BoxProps & {
  onConfigUpdate: (newConfig: ConfigState) => void;
};

const MenuBar: React.FC<MenuBarProps> = ({ onConfigUpdate, ...props }) => {
  return (
    <Box {...props}>
      <MessageLevelButtons onConfigUpdate={onConfigUpdate} />
    </Box>
  );
};

export default MenuBar;
