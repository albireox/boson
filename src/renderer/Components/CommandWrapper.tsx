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
  tooltip?: string;
  runningTooltip?: string;
  commandString?: string;
}

export type CommandWrapperProps = {
  commandString: string;
  children: React.ReactNode;
  abortCommand?: string;
  onStatusChange?: (event: string) => void;
  beforeCallback?: () => Promise<boolean | null>;
  isRunning?: boolean;
  tooltip?: string;
  runningTooltip?: string;
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
    tooltip,
    runningTooltip,
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
      if (onStatusChange) onStatusChange(event);
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
            } else if (result === null) {
              handleChange('idle');
              beforeCallbackSuccess = false;
            }
            return true;
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
    } else if (subscription || isRunning) {
      setAlertOpen(true);
    } else {
      // This should never happen, except if somehow the command
      // has become zombie.
      handleChange('idle');
    }
  }, [
    state,
    handleChange,
    beforeCallback,
    subscription,
    commandString,
    isRunning,
  ]);

  React.useEffect(() => {
    setState((current) => {
      if (isRunning === undefined) return current;

      if (isRunning) {
        return 'running';
      } else {
        if (current === 'error') {
          return 'error';
        } else {
          return 'idle';
        }
      }
    });
  }, [isRunning]);

  const wrapperValue = React.useMemo(
    () => ({ state, handleClick, tooltip, runningTooltip, commandString }),
    [state, handleClick, tooltip, runningTooltip, commandString]
  );

  return (
    <>
      <CommandWrapperContext.Provider value={wrapperValue}>
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
