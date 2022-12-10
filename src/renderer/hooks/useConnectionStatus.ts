/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-25
 *  @Filename: useConnectionStatus.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { ConnectionStatus } from 'main/tron/types';
import React from 'react';

export default function useConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = React.useState(
    ConnectionStatus.Unknown
  );

  const handleConnectionStatus = React.useCallback(
    (status: ConnectionStatus) => setConnectionStatus(status),
    []
  );

  React.useEffect(() => {
    // First time, just in case tron doesn't emit the status on time.
    window.electron.tron
      .getStatus()
      .then(handleConnectionStatus)
      .catch(() => {});

    // From now on just listen to the event.
    window.electron.ipcRenderer.on(
      'tron:connection-status',
      handleConnectionStatus
    );

    const unload = () => {
      window.electron.ipcRenderer.removeListener(
        'tron:connection-status',
        handleConnectionStatus
      );
    };

    window.addEventListener('unload', unload);

    return function cleanup() {
      unload();
    };
  }, [handleConnectionStatus]);

  return connectionStatus;
}
