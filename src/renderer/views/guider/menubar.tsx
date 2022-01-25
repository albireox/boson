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
  LinearProgressProps,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { round } from 'lodash';
import React from 'react';
import { BorderLinearProgress } from 'renderer/components/borderLinealProgress';
import { useKeywords } from 'renderer/hooks';
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

const ExposureProgress = (props: LinearProgressProps) => {
  const [etr, setEtr] = React.useState(0);
  const [totalTime, setTotalTime] = React.useState(0);

  const [intervalTimer, setIntervalTimer] = React.useState<NodeJS.Timeout | null>(null);

  const keyword = useKeywords(['fliswarm.exposure_state']);
  const exposureState = keyword['fliswarm.exposure_state'];

  const isGFA = exposureState && exposureState.values[0].startsWith('gfa');

  React.useEffect(() => {
    // If the exposure_state keyword is integrating and we are not already updating the ETR
    // (i.e., the intervalTimer variable is null), calculate initial ETR and start the timer.

    if (intervalTimer) return;

    const resolution = 0.1; // Refresh the progress bar every 0.1s

    if (
      exposureState &&
      exposureState.values[0].startsWith('gfa') &&
      exposureState.values[2] === 'integrating'
    ) {
      const expTime: number = exposureState.values[4];
      const etrThis: number = exposureState.values[5];
      const stackThis: number = exposureState.values[6];
      const stackTotal: number = exposureState.values[7];

      setTotalTime(expTime * stackTotal);
      const etrRemaining = (stackTotal - stackThis) * expTime + etrThis;

      setEtr(round(etrRemaining, 0));
      setIntervalTimer(setInterval(() => setEtr((e) => e - resolution), resolution * 1000));
    }
  }, [exposureState, intervalTimer]);

  React.useEffect(() => {
    // Every time the interval timer updates the ETR check if we are at zero. In that
    // case clear the interval.

    if (intervalTimer && etr <= 0) {
      clearInterval(intervalTimer);
      setIntervalTimer(null);
      setEtr(0);
    }
  }, [etr, intervalTimer]);

  if (isGFA && exposureState.values[2] !== 'idle') {
    return (
      <Stack direction='row' alignItems='center' spacing={1} width='100%' px={2}>
        <Stack flexGrow={1}>
          <BorderLinearProgress
            variant='determinate'
            value={(1 - etr / totalTime) * 100}
            sx={(theme) => ({
              '.MuiLinearProgress-bar': {
                backgroundColor:
                  isGFA && exposureState.values[2] === 'integrating'
                    ? theme.palette.mode === 'light'
                      ? '#1a90ff'
                      : '#308fe8'
                    : theme.palette.mode === 'light'
                    ? theme.palette.secondary.light
                    : theme.palette.secondary.dark
              }
            })}
          />
        </Stack>
        <Typography variant='body1' color='text.secondary'>
          {etr >= 0 ? round(etr, 0) : 0}s
        </Typography>
      </Stack>
    );
  } else {
    return <div style={{ flexGrow: 1 }} />;
  }
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
        {/* <Stack sx={{ flexGrow: 1 }} /> */}
        <ExposureProgress />
        {/* <Stack sx={{ flexGrow: 1 }} /> */}
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
