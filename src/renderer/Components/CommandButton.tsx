/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-30
 *  @Filename: CommandButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { CommandWrapperContext } from './CommandWrapper';

export default function CommandButton(
  props: LoadingButtonProps & { requireConfirmation?: boolean }
) {
  const context = React.useContext(CommandWrapperContext);
  const { handleClick, state, tooltip, runningTooltip, commandString } =
    context;

  const [openDialog, setOpenDialog] = React.useState(false);

  const {
    disableElevation = true,
    requireConfirmation = false,
    ...other
  } = props;

  const onClick = () => {
    if (requireConfirmation && !(state === 'running')) {
      setOpenDialog(true);
      return;
    }
    handleClick();
  };

  const handleDialog = () => {
    setOpenDialog(false);
    handleClick();
  };

  return (
    <>
      <Box alignSelf='center' onClick={onClick} sx={{ cursor: 'pointer' }}>
        <Tooltip title={state === 'running' ? runningTooltip : tooltip}>
          <span>
            <LoadingButton
              color={state === 'error' ? 'error' : 'primary'}
              loading={state === 'running'}
              disableElevation={disableElevation}
              {...other}
            />
          </span>
        </Tooltip>
      </Box>
      <Dialog open={openDialog}>
        <DialogTitle>Run command?</DialogTitle>
        <DialogContent>
          <DialogContent>
            {'Are you sure that you want to run the command '}
            <code>{commandString}</code>
            {'?'}
          </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialog()} autoFocus>
            Yes
          </Button>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
