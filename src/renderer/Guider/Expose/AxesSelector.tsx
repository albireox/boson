/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-29
 *  @Filename: AxesSelector.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import React from 'react';
import { useKeywords } from 'renderer/hooks';

export default function AxesSelector() {
  const { enabled_axes: enabledAxesKw } = useKeywords('cherno', [
    'enabled_axes',
  ]);

  const [enabledAxes, setEnabledAxes] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (enabledAxesKw) {
      setEnabledAxes(enabledAxesKw.values);
    }
  }, [enabledAxesKw]);

  const sendAxesCommand = (newAxes: string[]) => {
    const axes: string = newAxes.join(' ');
    window.electron.tron.send(`cherno set axes ${axes}`);
  };

  React.useEffect(() => {
    if (!enabledAxesKw) return () => {};

    if (
      enabledAxesKw.values.length === enabledAxes.length &&
      enabledAxesKw.values.every((x) => enabledAxes.includes(x))
    )
      return () => {};

    // If we have already started the timer cancel it. This prevents
    // sending multiple cherno set axes commands in quick succession if
    // several axes are being changed.
    const commandAxesTimeout = setTimeout(sendAxesCommand, 2000, enabledAxes);

    return () => clearTimeout(commandAxesTimeout);
  }, [enabledAxes, enabledAxesKw]);

  const handleChange = React.useCallback((_: unknown, newAxes: string[]) => {
    setEnabledAxes(newAxes);
  }, []);

  return (
    <Tooltip title='Click to select the axes to which corrections will be applied'>
      <ToggleButtonGroup
        color='primary'
        value={enabledAxes}
        onChange={handleChange}
        size='small'
      >
        <ToggleButton value='ra'>RA</ToggleButton>
        <ToggleButton value='dec'>Dec</ToggleButton>
        <ToggleButton value='rot'>Rot</ToggleButton>
        <ToggleButton value='focus'>Focus</ToggleButton>
      </ToggleButtonGroup>
    </Tooltip>
  );
}
