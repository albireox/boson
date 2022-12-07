/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-03
 *  @Filename: commandButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { CommandStatus } from 'main/tron/types';
import React from 'react';
import { Observable, Subscription } from 'rxjs';

function createCommandObservable(commandString: string) {
  if (commandString === 'mock') {
    return new Observable((subscriber) => {
      setTimeout(() => subscriber.complete(), 5000);
    });
  }
  return new Observable((subscriber) => {
    window.electron.tron
      .send(commandString)
      .then((command) => {
        if (command.status === CommandStatus.Done) {
          subscriber.complete();
        } else {
          subscriber.error();
        }
        return true;
      })
      .catch(() => {
        subscriber.error();
      });
  });
}

export type CommandStatusValues = 'idle' | 'running' | 'error';

export interface CommandContext {
  state: CommandStatusValues;
  handleClick: () => void;
  title?: string;
}

export type CommandWrapperProps = {
  commandString: string;
  children: React.ReactNode;
  abortCommand?: string;
  onStatusChange?: (event: string) => void;
  beforeCallback?: () => Promise<boolean>;
  isRunning?: boolean;
  title?: string;
};

export const CommandWrapperContext = React.createContext<CommandContext>({
  state: 'idle',
  handleClick: () => {},
});

export default function CommandWrapper(props: CommandWrapperProps) {
  const {
    commandString,
    abortCommand,
    onStatusChange,
    beforeCallback,
    isRunning,
    title,
    children,
  } = props;

  const [state, setState] = React.useState<CommandStatusValues>('idle');
  const [alertOpen, setAlertOpen] = React.useState(false);

  const [subscription, setSubscription] = React.useState<Subscription | null>(
    null
  );

  const handleChange = React.useCallback(
    (event: CommandStatusValues) => {
      setState(event);
      onStatusChange && onStatusChange(event);
    },
    [onStatusChange]
  );

  const handleClick = React.useCallback(() => {
    if (state !== 'running') {
      handleChange('running');

      if (beforeCallback) {
        let beforeCallbackSuccess = true;

        beforeCallback()
          .then((result) => {
            if (result === false) {
              handleChange('error');
              beforeCallbackSuccess = false;
              return false;
            }
            return false;
          })
          .catch(() => {
            handleChange('error');
            beforeCallbackSuccess = false;
          });

        if (!beforeCallbackSuccess) return;
      }

      setSubscription(
        createCommandObservable(commandString).subscribe({
          complete() {
            handleChange('idle');
          },
          error() {
            handleChange('error');
          },
        })
      );
    } else if (subscription) {
      setAlertOpen(true);
    } else {
      // This should never happen, except if somehow the command
      // has become zombie.
      handleChange('idle');
    }
  }, [state, handleChange, beforeCallback, subscription, commandString]);

  React.useEffect(() => {
    setState((current) => {
      if (isRunning !== undefined && isRunning && current !== 'running')
        return 'running';

      return current;
    });
  }, [isRunning]);

  return (
    <>
      <CommandWrapperContext.Provider value={{ state, handleClick, title }}>
        {children}
      </CommandWrapperContext.Provider>
      <Dialog open={alertOpen}>
        <DialogTitle>Cancel command?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to cancel the currently running command{' '}
            <strong>{commandString}</strong>.
            {abortCommand
              ? ` This command will be cancelled with ${abortCommand}.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)}>No</Button>
          <Button
            onClick={() => {
              subscription?.unsubscribe();
              setSubscription(null);
              if (abortCommand) window.electron.tron.send(abortCommand);
              handleChange('idle');
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
