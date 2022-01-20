/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: menubar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import OpenInBrowser from '@mui/icons-material/OpenInBrowser';
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Tooltip
} from '@mui/material';
import React from 'react';
import { IJS9Opts, JS9Opts } from '.';

type MenuBarProps = {
  onUpdate: (newOpts: Partial<IJS9Opts>) => void;
  gidSelected: number;
  urls: { [gid: number]: string };
};

const AlertDialog = ({
  open,
  message,
  onOK
}: {
  open: boolean;
  message: string;
  onOK: () => void;
}) => {
  return (
    <Dialog open={open} fullWidth={true} maxWidth='xs'>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onOK} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const MenuBar = ({
  onUpdate,
  gidSelected,
  urls,
  ...props
}: MenuBarProps & React.HTMLProps<HTMLDivElement>) => {
  const cmaps = ['Grey', 'Heat', 'Cool', 'Viridis', 'Magma', 'Red', 'Green', 'Blue'];

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

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  const applyZoom = (command: string) => {
    for (let i = 1; i <= 6; i++) {
      window.JS9.SetZoom(command, { display: `gfa${i}` });
    }
  };

  const reset = React.useCallback(() => {
    for (let i = 1; i <= 6; i++) {
      window.JS9.SetColormap('reset', { display: `gfa${i}` });
      window.JS9.SetColormap(cmap, { display: `gfa${i}` });
      window.JS9.SetScale(scale, { display: `gfa${i}` });
    }
  }, [cmap, scale]);

  React.useEffect(() => {
    reset();
  }, [reset]);

  const openInDS9 = () => {
    if (gidSelected === 0) {
      setErrorMessage('You must select or zoom on an image to open it in DS9.');
      return;
    }

    if (!urls[gidSelected]) {
      setErrorMessage('There is no image associated with this JS9 frame.');
      return;
    }

    const xpaset = window.api.store.get_sync('user.guider.xpaset');

    for (const command of ['frame new', `url ${urls[gidSelected]}`]) {
      window.api.openInApplication(`${xpaset} -p ds9 ${command}`).catch((err: Error) => {
        setErrorMessage(
          `${err.message} xpaset must be installed and DS9 open and connected. ` +
            'Use the preferences to change the path to xpaset.'
        );
      });
    }
  };

  return (
    <>
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
            <Tooltip title='Open in DS9'>
              <Button
                sx={{ height: '33px', minWidth: '0px' }}
                variant='outlined'
                size='medium'
                onClick={(e) => openInDS9()}
              >
                <OpenInBrowser />
              </Button>
            </Tooltip>
          </FormControl>
          <FormControl>
            <ButtonGroup variant='outlined'>
              <Button variant='outlined' size='medium' onClick={(e) => reset()}>
                Reset
              </Button>
              <Button variant='outlined' size='medium' onClick={(e) => applyZoom('toFit')}>
                Fit
              </Button>
            </ButtonGroup>
          </FormControl>
          <FormControl>
            <ButtonGroup variant='outlined'>
              <Button onClick={(e) => applyZoom('out')}>-</Button>
              <Button onClick={(e) => applyZoom('in')}>+</Button>
            </ButtonGroup>
          </FormControl>
        </Stack>
      </div>
      <AlertDialog
        open={errorMessage !== undefined}
        message={errorMessage || ''}
        onOK={() => setErrorMessage(undefined)}
      />
    </>
  );
};
