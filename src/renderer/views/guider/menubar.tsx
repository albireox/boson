/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: menubar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import {
  Button,
  ButtonGroup,
  FormControl,
  MenuItem,
  Select,
  Stack
} from '@mui/material';
import React from 'react';
import { IJS9Opts, JS9Opts } from '.';

export const MenuBar: React.FC<
  React.HTMLProps<HTMLDivElement> & {
    onUpdate: (newOpts: Partial<IJS9Opts>) => void;
  }
> = ({ onUpdate, ...props }) => {
  const cmaps = [
    'Grey',
    'Heat',
    'Cool',
    'Viridis',
    'Magma',
    'Red',
    'Green',
    'Blue'
  ];

  const scales = [
    'linear',
    'log',
    'histeq',
    'power',
    'sqrt',
    'squared',
    'asinh',
    'sinh',
    'zscale',
    'dataminmax'
  ];

  const [cmap, setCmap] = React.useState(JS9Opts.colormap);
  const [scale, setScale] = React.useState(JS9Opts.scale);

  const applyZoom = (command: string) => {
    for (let i = 1; i <= 6; i++) {
      window.JS9.SetZoom(command, { display: `gfa${i}` });
    }
  };

  const reset = () => {
    for (let i = 1; i <= 6; i++) {
      window.JS9.SetColormap('reset', { display: `gfa${i}` });
    }
  };

  return (
    <div {...props}>
      <Stack direction='row' spacing={1} sx={{ alignSelf: 'left' }}>
        <FormControl size='small'>
          <Select
            value={cmap}
            onChange={(event) => {
              setCmap(event.target.value as string);
              onUpdate({ colormap: event.target.value as string });
            }}
          >
            {cmaps.map((_cmap) => {
              return (
                <MenuItem key={_cmap} value={_cmap.toLowerCase()}>
                  <img
                    alt={_cmap}
                    style={{ marginRight: '4px' }}
                    src={
                      process.env.PUBLIC_URL +
                      `/js9/images/toolbar/dax_images/cmap_${_cmap.toLowerCase()}.png`
                    }
                  />
                  {_cmap}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl size='small'>
          <Select
            value={scale}
            onChange={(event) => {
              setScale(event.target.value as string);
              onUpdate({ scale: event.target.value as string });
            }}
          >
            {scales.map((_scale) => {
              return (
                <MenuItem key={_scale} value={_scale.toLowerCase()}>
                  {_scale}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Stack>
      <Stack sx={{ flexGrow: 1 }}></Stack>
      <Stack direction='row' spacing={1} sx={{ alignSelf: 'center' }}>
        <FormControl>
          <Button variant='outlined' size='medium' onClick={(e) => reset()}>
            Reset
          </Button>
        </FormControl>
        <FormControl>
          <Button
            variant='outlined'
            size='medium'
            onClick={(e) => applyZoom('toFit')}
          >
            Fit
          </Button>
        </FormControl>
        <FormControl>
          <ButtonGroup variant='outlined'>
            <Button onClick={(e) => applyZoom('out')}>-</Button>
            <Button onClick={(e) => applyZoom('in')}>+</Button>
          </ButtonGroup>
        </FormControl>
      </Stack>
    </div>
  );
};
