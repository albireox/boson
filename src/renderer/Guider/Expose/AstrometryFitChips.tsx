/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-30
 *  @Filename: AstrometryFitChips.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Chip, Tooltip } from '@mui/material';
import { round } from 'lodash';
import React from 'react';
import { useKeywords } from 'renderer/hooks';

type ValidColors =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

export default function AstrometryFitChips() {
  const {
    astrometry_fit: astrometryFitKw,
    guide_rms: guideRMSKw,
    acquisition_valid: acquisitionValidKw,
  } = useKeywords('cherno', [
    'astrometry_fit',
    'guide_rms',
    'acquisition_valid',
  ]);

  const [FWHM, setFWHM] = React.useState('');
  const [FWHMColor, setFWHMColor] = React.useState<ValidColors>('default');

  const [RMS, setRMS] = React.useState('');
  const [RMSColor, setRMSColor] = React.useState<ValidColors>('default');
  const [solved, setSolved] = React.useState(false);

  React.useEffect(() => {
    if (astrometryFitKw) {
      const FWHMKw = astrometryFitKw.values[4];
      if (FWHMKw < 0) {
        setFWHM('?');
        setFWHMColor('secondary');
      } else {
        setFWHM(`${round(FWHMKw, 2).toString()}"`);
        if (FWHMKw >= 0 && FWHMKw < 1.5) {
          setFWHMColor('success');
        } else if (FWHMKw >= 1.5 && FWHMKw < 2.5) {
          setFWHMColor('warning');
        } else {
          setFWHMColor('error');
        }
      }
    }

    if (guideRMSKw) {
      const RMSKw = guideRMSKw.values[3];
      if (RMSKw < 0) {
        setRMS('?');
        setRMSColor('secondary');
      } else {
        setRMS(round(RMSKw, 2).toString());
        if (RMSKw >= 0 && RMSKw < 0.07) {
          setRMSColor('success');
        } else if (RMSKw >= 0.07 && RMSKw < 0.1) {
          setRMSColor('warning');
        } else {
          setRMSColor('error');
        }
      }
    }

    if (acquisitionValidKw) {
      const didAcquire = acquisitionValidKw.values[0] === 'T';

      setSolved(didAcquire);

      // If it didn't acquire there's no guarantee the RMS and FWHM are recent.
      // We mark them with the default colour.
      if (!didAcquire) {
        setRMSColor('default');
        setFWHMColor('default');
      }
    }
  }, [acquisitionValidKw, guideRMSKw, astrometryFitKw]);

  const RMSElement = (
    <Tooltip title='RMS of the last fit'>
      <Chip
        variant='outlined'
        label={`RMS ${RMS}"`}
        color={RMSColor}
        sx={{ opacity: solved ? 1.0 : 0.5, alignSelf: 'center' }}
      />
    </Tooltip>
  );

  const FWHMElement = (
    <Tooltip title='FWHM of the last fit'>
      <Chip
        variant='outlined'
        label={`FWHM ${FWHM}`}
        color={FWHMColor}
        sx={{ opacity: solved ? 1.0 : 0.5, alignSelf: 'center' }}
      />
    </Tooltip>
  );

  const AcquisitionElement = (
    <Tooltip title='Was the last guide iteration successful?'>
      <Chip
        variant='outlined'
        label={solved ? 'Solved' : 'Not solved'}
        color={solved ? 'success' : 'error'}
        sx={{ alignSelf: 'center' }}
      />
    </Tooltip>
  );

  return (
    <>
      {AcquisitionElement}
      {RMS !== '' ? RMSElement : null}
      {FWHM !== '' ? FWHMElement : null}
    </>
  );
}
