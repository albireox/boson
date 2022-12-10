/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: useEventListener.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

// Adapted from https://usehooks.com/useEventListener/

export default function useEventListener(
  eventName: string,
  handler: () => void
) {
  const savedHandler = React.useRef<() => void>();
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  React.useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  React.useEffect(() => {
    window.electron.ipcRenderer.removeAllListeners(eventName);

    const eventListener = () => {
      if (!savedHandler || !savedHandler.current) return {};
      return savedHandler.current();
    };

    // Add event listener
    window.electron.ipcRenderer.on(eventName, eventListener);

    // Remove event listener on cleanup
    return () =>
      window.electron.ipcRenderer.removeListener(eventName, eventListener);
  }, [eventName]);
}
