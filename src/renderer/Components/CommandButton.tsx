/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-30
 *  @Filename: CommandButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import { Box, Tooltip } from '@mui/material';
import React from 'react';
import { CommandWrapperContext } from './CommandWrapper';

export default function CommandButton(props: LoadingButtonProps) {
  const context = React.useContext(CommandWrapperContext);
  const { handleClick, state, tooltip, runningTooltip } = context;

  const { disableElevation = true, ...other } = props;

  return (
    <Box alignSelf='center' onClick={handleClick}>
      <Tooltip title={state === 'running' ? runningTooltip : tooltip}>
        <span>
          <LoadingButton
            loading={state === 'running'}
            sx={{
              '&.Mui-disabled': { pointerEvents: 'auto', cursor: 'pointer' },
            }}
            disableElevation={disableElevation}
            {...other}
          />
        </span>
      </Tooltip>
    </Box>
  );
}
