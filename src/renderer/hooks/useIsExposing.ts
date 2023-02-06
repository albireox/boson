/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-02-04
 *  @Filename: useIsExposing.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useEffect, useState } from 'react';
import useKeywords from './useKeywords';
import useStore from './useStore';

export interface UseIsExposingOpts {
  readingOk: boolean;
  camera: 'both' | 'apogee' | 'boss';
}

export default function useIsExposing(opts?: UseIsExposingOpts) {
  const { readingOk = true, camera = 'both' } = opts ?? {};

  const keywords = useKeywords([
    'boss.exposureState',
    'yao.sp2_status_names',
    'apogee.exposureState',
  ]);
  const { 'boss.exposureState': bossState } = keywords;
  const { 'yao.sp2_status_names': yaoState } = keywords;
  const { 'apogee.exposureState': apogeeState } = keywords;

  const [observatory] = useStore<string>('connection.observatory');

  const [bossExposing, setBossExposing] = useState(false);
  const [apogeeExposing, setApogeeExposing] = useState(false);

  useEffect(() => {
    if (observatory.toUpperCase() !== 'APO') return;
    if (!bossState || !bossState.values) return;

    const expState: string = bossState.values[0].toLowerCase();
    if (expState === 'idle' || expState === 'aborted') {
      setBossExposing(false);
    } else if (
      readingOk &&
      (expState === 'reading' || expState === 'prereading')
    ) {
      setBossExposing(false);
    } else {
      setBossExposing(true);
    }
  }, [bossState, observatory, readingOk]);

  useEffect(() => {
    if (observatory.toUpperCase() !== 'LCO') return;
    if (!yaoState || !yaoState.values) return;

    const expState: string = yaoState.values[0].toLowerCase();
    if (expState.includes('idle') && !expState.includes('readout_pending')) {
      setBossExposing(false);
    } else if (readingOk && expState.includes('reading')) {
      setBossExposing(false);
    } else {
      setBossExposing(true);
    }
  }, [yaoState, observatory, readingOk]);

  useEffect(() => {
    if (!apogeeState || !apogeeState.values) return;

    const expState: string = apogeeState.values[0].toLowerCase();
    if (expState === 'exposing' || expState === 'stopping') {
      setApogeeExposing(true);
    } else {
      setApogeeExposing(false);
    }
  }, [apogeeState]);

  if (camera === 'boss') {
    return bossExposing;
  }

  if (camera === 'apogee') {
    return apogeeExposing;
  }

  return bossExposing || apogeeExposing;
}
