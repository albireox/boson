/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: ExposureProgress.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { LinearProgress } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useKeywordContext } from 'renderer/hooks';

export default function ExposureProgress() {
  const [isExposing, setIsExposing] = React.useState(false);
  const [isReading, setIsReading] = React.useState(false);
  const [isUndefined, setIsUndefined] = React.useState(true);
  const [exposureTime, setExposureTime] = React.useState(15);
  const [elapsedTime, setElapsedTime] = React.useState(15);

  const { exposure_state: exposureState } = useKeywordContext();

  const elapsedTimeInterval = React.useRef<NodeJS.Timer | null>(null);
  const currentState = React.useRef<string>('idle');

  React.useEffect(() => {
    if (!isExposing) {
      setElapsedTime(0);
      elapsedTimeInterval.current && clearInterval(elapsedTimeInterval.current);
      return;
    }

    elapsedTimeInterval.current = setInterval(
      () => setElapsedTime((current) => current + 0.2),
      200
    );
  }, [isExposing, exposureTime]);

  React.useEffect(() => {
    if (exposureState && exposureState.values[1].startsWith('gfa')) {
      if (isUndefined && exposureState.values[2] === 'idle') {
        setIsUndefined(false);
      }

      if (currentState.current === exposureState.values[2]) return;

      // eslint-disable-next-line prefer-destructuring
      currentState.current = exposureState.values[2];

      const expTime: number = exposureState.values[4];
      const stackTotal: number = exposureState.values[7];

      if (currentState.current === 'integrating' && !isExposing) {
        setIsExposing(true);
        setExposureTime(expTime * stackTotal);
      } else if (currentState.current === 'reading') {
        setIsExposing(false);
        setIsReading(true);
      } else if (currentState.current === 'idle') {
        setIsExposing(false);
        setIsReading(false);
      }
    }
  }, [exposureState, isExposing, isReading, isUndefined]);

  return isExposing || isReading ? (
    <LinearProgress
      variant={isUndefined || isReading ? 'indeterminate' : 'determinate'}
      value={(elapsedTime / exposureTime) * 100}
      sx={(theme) => ({
        width: '100%',
        height: 10,
        borderRadius: 3,
        '&.MuiLinearProgress-root': { mx: 4 },
        '& .MuiLinearProgress-bar': {
          backgroundColor:
            theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
        },
      })}
    />
  ) : (
    <Box flexGrow={1} />
  );
}
