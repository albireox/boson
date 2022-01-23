/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: guide.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Box, Chip, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { round } from 'lodash';
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
    <Tooltip title='Click to select the axes to which corrections will be applied'>
      <ToggleButtonGroup
        color='secondary'
        value={enabledAxes}
        onChange={handleChange}
        size='small'
      >
        <ToggleButton
          color={enabledAxes.includes('radec') ? 'primary' : 'secondary'}
          selected={true}
          value='radec'
        >
          RA|Dec
        </ToggleButton>
        <ToggleButton
          color={enabledAxes.includes('rot') ? 'primary' : 'secondary'}
          selected={true}
          value='rot'
        >
          Rot
        </ToggleButton>
        <ToggleButton
          color={enabledAxes.includes('focus') ? 'primary' : 'secondary'}
          selected={true}
          value='focus'
        >
          Focus
        </ToggleButton>
      </ToggleButtonGroup>
    </Tooltip>
  );
};

const AstrometryFitStack = () => {
  const keywords = useKeywords([
    'cherno.astrometry_fit',
    'cherno.guide_rms',
    'cherno.acquisition_valid'
  ]);

  const [fwhm, setFwhm] = React.useState('');
  const [fwhmColor, setFwhmColor] = React.useState<any>('default');

  const [rms, setRms] = React.useState('');
  const [rmsColor, setRmsColor] = React.useState<any>('default');

  const [acquired, setAcquired] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const astrometry_fit = keywords['cherno.astrometry_fit'];
    if (astrometry_fit) {
      const fwhm = astrometry_fit.values[4];
      if (fwhm < 0) {
        setFwhm('?');
        setFwhmColor('secondary');
      } else {
        setFwhm(round(fwhm, 2).toString() + '"');
        if (fwhm >= 0 && fwhm < 1.5) {
          setFwhmColor('success');
        } else if (fwhm >= 1.5 && fwhm < 2.5) {
          setFwhmColor('warning');
        } else {
          setFwhmColor('error');
        }
      }
    }

    const guide_rms = keywords['cherno.guide_rms'];
    if (guide_rms) {
      const rms = guide_rms.values[3];
      if (rms < 0) {
        setRms('?');
        setRmsColor('secondary');
      } else {
        setRms(round(rms, 3).toString());
        if (rms >= 0 && rms < 0.07) {
          setRmsColor('success');
        } else if (rms >= 0.07 && rms < 0.1) {
          setRmsColor('warning');
        } else {
          setRmsColor('error');
        }
      }
    }

    if (keywords['cherno.acquisition_valid']) {
      const did_acquire = keywords['cherno.acquisition_valid'].values[0] === 'T';

      setAcquired(did_acquire);

      // If it didn't acquire there's no guarantee the RMS and FWHM are recent. We mark
      // them with the default colour.
      if (!did_acquire) {
        setRmsColor('default');
        setFwhmColor('default');
      }
    }
  }, [keywords]);

  const RMSElement = (
    <Tooltip title='RMS of the last fit'>
      <Chip variant='outlined' label={`RMS ${rms} \u00b5m`} color={rmsColor} />
    </Tooltip>
  );
  const FWHMElement = (
    <Tooltip title='FWHM of the last fit'>
      <Chip variant='outlined' label={`FWHM ${fwhm}`} color={fwhmColor} />
    </Tooltip>
  );
  const AcquisitionElement = (
    <Tooltip title='Was the last guide iteration successful?'>
      <Chip
        variant='outlined'
        label={acquired === true ? 'Acquired' : 'Acquisition failed'}
        color={acquired === true ? 'success' : 'error'}
      />
    </Tooltip>
  );

  return (
    <Stack pl={1} spacing={1} direction='row' alignItems={'center'} justifyContent={'center'}>
      {rms !== '' ? RMSElement : null}
      {fwhm !== '' ? FWHMElement : null}
      {acquired !== undefined ? AcquisitionElement : null}
    </Stack>
  );
};

export const GuideStack = () => {
  const [expTime, setExpTime] = React.useState<number | undefined>(15);

  return (
    <Box sx={{ overflowX: 'scroll' }}>
      <Stack direction='row' pt={2} pb={0} spacing={1} alignItems={'center'}>
        <AxesGroup />
        <AstrometryFitStack />

        <div css={{ flexGrow: 1 }} />

        <ValidatedNumberInput
          label='Exposure Time'
          value={expTime}
          onChange={(e, value) => setExpTime(value)}
          startAdornment={<AccessTimeIcon />}
          endAdornment='s'
          sx={{ minWidth: '100px', maxWidth: '120px', pr: '10px' }}
        />
        <CommandButton
          commandString={`fliswarm talk -c gfa expose ${expTime || ''}`}
          endIcon={<CameraAltIcon fontSize='inherit' />}
          tooltip='Take a single exposure with all cameras'
        />
        <CommandButton
          commandString={`cherno acquire -c -t ${expTime || ''}`}
          abortCommand='cherno stop'
          size='medium'
          sx={{ minWidth: '80px' }}
          tooltip='Start/stop the guide loop'
        >
          Guide
        </CommandButton>
      </Stack>
    </Box>
  );
};
