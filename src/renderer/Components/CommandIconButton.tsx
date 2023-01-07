/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-30
 *  @Filename: CommandIconButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { CommandWrapperContext } from './CommandWrapper';

export interface CommandIconButtonProps {
  children: React.ReactNode;
  width?: number;
  disabled?: boolean;
}

function CircularProgressCommand() {
  return <CircularProgress sx={{ p: 0 }} style={{ height: 16, width: 16 }} />;
}

export default function CommandIconButton(props: CommandIconButtonProps) {
  const context = React.useContext(CommandWrapperContext);
  const { handleClick, state, tooltip, runningTooltip } = context;

  const { children, disabled = false, width = 33 } = props;

  return (
    <Tooltip title={state === 'running' ? runningTooltip : tooltip}>
      <span>
        <IconButton
          onClick={handleClick}
          style={{ height: width, width }}
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'unset',
              color: theme.palette.text.primary,
            },
          })}
          disabled={disabled}
          disableFocusRipple
          disableRipple
          disableTouchRipple
        >
          {state === 'running' ? <CircularProgressCommand /> : children}
        </IconButton>
      </span>
    </Tooltip>
  );
}
