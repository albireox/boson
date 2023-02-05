/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-02-04
 *  @Filename: SnackAlert.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  AlertProps,
  Button,
  Collapse,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';

export interface SnackAlertRefType {
  open: () => void;
}

interface SnackAlertProps {
  message: string;
  severity?: AlertProps['severity'];
  autoHideDuration?: null | number;
  actionText?: string;
  action?: () => void;
  showClose?: boolean;
}

interface ActionButtonProps {
  message: string;
  action?: () => void;
}

function ActionButton(props: ActionButtonProps) {
  const { message, action } = props;

  return (
    <Button
      color='inherit'
      size='small'
      onClick={action}
      sx={{ minWidth: '32px' }}
    >
      {message}
    </Button>
  );
}

const SnackAlert = React.forwardRef<SnackAlertRefType, SnackAlertProps>(
  (props, ref) => {
    const {
      message,
      autoHideDuration = 5000,
      severity = 'warning',
      showClose = true,
      actionText,
      action,
    } = props;

    const [open, setOpen] = React.useState(false);

    React.useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));

    const handleClose = React.useCallback(() => setOpen(false), []);

    return (
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        TransitionComponent={Collapse}
      >
        <Alert
          elevation={6}
          variant='filled'
          onClose={handleClose}
          severity={severity}
          sx={{
            width: '100%',
            '& .MuiAlert-message': { alignSelf: 'center' },
            '& .MuiAlert-action': {
              padding: '0px 0px 0px 16px',
              placeItems: 'center',
            },
          }}
          action={
            <Stack direction='row' spacing={0}>
              {actionText && (
                <ActionButton
                  message={actionText}
                  action={() => {
                    if (action !== undefined) action();
                    handleClose();
                  }}
                />
              )}
              {showClose && (
                <IconButton
                  onClick={handleClose}
                  color='inherit'
                  sx={{ p: 0.5 }}
                >
                  <CloseIcon sx={{ fontSize: '16px' }} />
                </IconButton>
              )}
            </Stack>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    );
  }
);

export default SnackAlert;
