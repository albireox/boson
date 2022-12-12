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
import { useElapsedTime } from 'use-elapsed-time';

export default function ExposureProgress() {
  const [isExposing, setIsExposing] = React.useState(false);
  const [isReading, setIsReading] = React.useState(false);
  const [isUndefined, setIsUndefined] = React.useState(true);
  const [exposureTime, setExposureTime] = React.useState(15);

  const { exposure_state: exposureState } = useKeywordContext();

  const { elapsedTime, reset } = useElapsedTime({
    isPlaying: isExposing,
    duration: exposureTime,
    updateInterval: 0.1,
    onComplete: () => {
      reset();
    },
  });

  React.useEffect(() => {
    if (exposureState && exposureState.values[0].startsWith('gfa')) {
      const currentState = exposureState.values[2];
      const expTime: number = exposureState.values[4];
      const stackTotal: number = exposureState.values[7];

      if (isUndefined && currentState === 'idle') {
        setIsUndefined(false);
      }

      if (currentState === 'integrating' && !isExposing) {
        setIsExposing(true);
        setExposureTime(expTime * stackTotal);
        reset();
      } else if (currentState === 'reading') {
        setIsExposing(false);
        setIsReading(true);
      } else if (currentState === 'idle') {
        setIsExposing(false);
        setIsReading(false);
      }
    }
  }, [exposureState, isExposing, isReading, isUndefined, reset]);

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
