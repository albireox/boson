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
  IconButton
} from '@mui/material';
import { TronEventReplyIFace } from 'main/events';
import { CommandStatus } from 'main/tron';
import React from 'react';
import { Observable, Subscription } from 'rxjs';

/** @jsxImportSource @emotion/react */

function createCommandObservable(command: string) {
  return new Observable((subscriber) => {
    window.api
      .invoke('tron-send-command', command)
      .then((reply: TronEventReplyIFace) => {
        subscriber.next(reply);
        if (reply.status === CommandStatus.Done) {
          subscriber.complete();
        } else {
          subscriber.error();
        }
      })
      .catch(subscriber.error());
  });
}

type CommandButtonProps = ButtonProps & {
  commandString: string;
  abortCommand?: string;
  onEvent?: (event: string) => void;
};

export function CommandButton({
  commandString,
  abortCommand,
  onEvent,
  ...props
}: CommandButtonProps) {
  const baseIcon = props.endIcon || <SendIcon />;
  const variant = props.variant || 'contained';

  const [running, setRunning] = React.useState(false);
  const [endIcon, setEndIcon] = React.useState(baseIcon);
  const [sx, setSx] = React.useState(props.sx);
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
      if (newState === 'error') {
        setColor('error');
      }
    }
  }

  function handleClick() {
    if (!running) {
      const observable = createCommandObservable(commandString);
      setSubscription(
        observable.subscribe({
          next(x) {
            console.log(x);
          },
          complete() {
            changeButtonState('idle');
          },
          error() {
            changeButtonState('error');
          }
        })
      );
      changeButtonState('running');
    } else {
      if (subscription) {
        setAlertOpen(true);
      } else {
        // This should never happen, except if somehow the command
        // has become zombie.
        changeButtonState('idle');
      }
    }
  }

  props.size = props.size || 'small';

  let button: React.ReactNode;

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
      {button}
      <Dialog open={alertOpen}>
        <DialogTitle>{'Cancel command?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to cancel the currently running command &ldquo;
            {commandString}&rdquo;.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)}>No</Button>
          <Button
            onClick={() => {
              subscription?.unsubscribe();
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
