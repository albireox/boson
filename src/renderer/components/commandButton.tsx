/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-03
 *  @Filename: commandButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SendIcon from '@mui/icons-material/Send';
import {
  Button,
  ButtonProps,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  SxProps,
  Theme,
  Tooltip
} from '@mui/material';
import { TronEventReplyIFace } from 'main/events';
import { CommandStatus } from 'main/tron/types';
import React from 'react';
import { Observable, Subscription } from 'rxjs';

/** @jsxImportSource @emotion/react */

function createCommandObservable(command: string) {
  if (command === 'mock') {
    return new Observable((subscriber) => {
      setTimeout(() => subscriber.complete(), 5000);
    });
  }
  return new Observable((subscriber) => {
    window.api.tron
      .send(command)
      .then((reply: TronEventReplyIFace) => {
        if (reply.status === CommandStatus.Done) {
          subscriber.complete();
        } else {
          subscriber.error();
        }
      })
      .catch(() => {
        subscriber.error();
      });
  });
}

type CommandButtonProps = ButtonProps & {
  commandString: string;
  abortCommand?: string;
  onEvent?: (event: string) => void;
  beforeCallback?: () => boolean | Promise<boolean | null>;
  tooltip?: string;
};

export function CommandButton({
  commandString,
  abortCommand,
  onEvent,
  beforeCallback,
  tooltip,
  ...props
}: CommandButtonProps) {
  const baseIcon = props.endIcon || <SendIcon />;
  const variant = props.variant || 'outlined';

  const [running, setRunning] = React.useState(false);
  const [endIcon, setEndIcon] = React.useState(baseIcon);
  const [sx, setSx] = React.useState<SxProps<Theme>>(props.sx || {});
  const [color, setColor] = React.useState<any>('primary');
  const [alertOpen, setAlertOpen] = React.useState(false);

  const [subscription, setSubscription] = React.useState<Subscription | null>(null);

  function changeButtonState(newState: string) {
    setRunning(newState === 'running');
    if (onEvent) onEvent(newState);
    if (newState === 'running') {
      setEndIcon(<CircularProgress size={20} color='inherit' />);
      setColor('primary');
      setSx({
        backgroundColor: (theme) => theme.palette.action.disabledBackground,
        color: (theme) => theme.palette.action.disabled,
        '&:hover': {
          backgroundColor: (theme) => theme.palette.action.selected
        }
      });
    } else {
      setEndIcon(baseIcon);
      setSx({});
      setSubscription(null);
      setAlertOpen(false);
      if (newState === 'error') {
        setColor('error');
      }
    }
  }

  async function handleClick() {
    if (!running) {
      changeButtonState('running');

      if (beforeCallback) {
        const result = await beforeCallback();
        if (result === false) {
          changeButtonState('error');
          return;
        } else if (result === null) {
          changeButtonState('idle');
          return;
        }
      }

      setSubscription(
        createCommandObservable(commandString).subscribe({
          complete() {
            changeButtonState('idle');
          },
          error() {
            changeButtonState('error');
          }
        })
      );
    } else {
      if (subscription) {
        setAlertOpen(true);
      } else {
        // This should never happen, except if somehow the command has become zombie.
        changeButtonState('idle');
      }
    }
  }

  props.size = props.size || 'small';

  let button: React.ReactElement;

  if (props.children !== undefined) {
    button = (
      <Button
        sx={sx}
        {...props}
        color={color}
        variant={variant}
        onClick={() => handleClick()}
        endIcon={endIcon}
      />
    );
  } else {
    button = (
      <IconButton color={color} onClick={() => handleClick()} sx={sx}>
        {endIcon}
      </IconButton>
    );
  }

  return (
    <>
      <Tooltip title={tooltip || ''}>{button}</Tooltip>
      <Dialog open={alertOpen}>
        <DialogTitle>{'Cancel command?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to cancel the currently running command <strong>{commandString}</strong>.
            {abortCommand ? ` This command will be cancelled with ${abortCommand}.` : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)}>No</Button>
          <Button
            onClick={() => {
              subscription?.unsubscribe();
              setSubscription(null);
              if (abortCommand) window.api.tron.send(abortCommand);
              changeButtonState('idle');
              setAlertOpen(false);
            }}
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
