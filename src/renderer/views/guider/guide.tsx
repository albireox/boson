/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: guide.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Chip, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react';
import { CommandButton } from 'renderer/components/commandButton';
import { useKeywords } from 'renderer/hooks';
import { ValidatedNumberInput } from '../../components/validatedInput';

/** @jsxImportSource @emotion/react */

// This declaration must be here to prevent re-renders overriding it.
let commandAxesTimeout: NodeJS.Timeout | null = null;

const AxesGroup = () => {
  const keyword = useKeywords(['cherno.enabled_axes']);

  const [enabledAxes, setEnabledAxes] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (keyword['cherno.enabled_axes']) {
      setEnabledAxes(keyword['cherno.enabled_axes'].values);
    }
  }, [keyword]);

  const sendAxesCommand = (newAxes: string[]) => {
    const axes: string = newAxes.join(' ');
    window.api.tron.send(`cherno set axes ${axes}`);
  };

  const handleChange = (event: React.MouseEvent<HTMLElement>, newAxes: string[]) => {
    setEnabledAxes(newAxes);

    // If we have already started the timer cancel it. This prevents sending multiple
    // cherno set axes commands in quick succession if several axes are being changed.
    if (commandAxesTimeout !== null) {
      clearTimeout(commandAxesTimeout);
      commandAxesTimeout = null;
    }
    commandAxesTimeout = setTimeout(sendAxesCommand, 3000, newAxes);
  };

  return (
    <ToggleButtonGroup color='primary' value={enabledAxes} onChange={handleChange} size='small'>
      <ToggleButton value='radec'>RA|Dec</ToggleButton>
      <ToggleButton value='rot'>Rot</ToggleButton>
      <ToggleButton value='focus'>Focus</ToggleButton>
    </ToggleButtonGroup>
  );
};
export const GuideStack = () => {
  const [expTime, setExpTime] = React.useState<number | undefined>(15);

  return (
      <AxesGroup />
      <ValidatedNumberInput
        label='Exposure Time'
        value={expTime}
        onChange={(e, value) => setExpTime(value)}
        startAdornment={<AccessTimeIcon />}
        endAdornment='s'
        sx={{ maxWidth: '120px' }}
      />
      <div css={{ flexGrow: 1 }} />
      <CommandButton
        commandString={`fliswarm talk -c gfa expose ${expTime || ''}`}
        endIcon={<CameraAltIcon fontSize='inherit' />}
      />
      <CommandButton
        commandString={`cherno acquire -c -t ${expTime || ''}`}
        abortCommand='cherno stop'
      >
        Guide
      </CommandButton>
    </Stack>
  );
};
