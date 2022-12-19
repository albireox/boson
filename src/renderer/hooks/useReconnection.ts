/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-18
 *  @Filename: useReconnection.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { ConnectionStatus } from 'main/tron/types';
import React from 'react';
import useConnectionStatus from './useConnectionStatus';
import usePrevious from './usePrevious';

export default function useReconnection() {
  const [connectionStatus, isReady] = useConnectionStatus();
  const prevStatus = usePrevious<ConnectionStatus | null>(null);

  const [connectTrigger, setConnectTrigger] = React.useState(0);

  React.useEffect(() => {
    if (isReady && connectionStatus === prevStatus.current) {
      setConnectTrigger((current) => current + 1);
    }
    prevStatus.current = connectionStatus;
  }, [connectionStatus, isReady, prevStatus]);

  return connectTrigger;
}
