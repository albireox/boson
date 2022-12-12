/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-30
 *  @Filename: ExposeButtons.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import InsightsIcon from '@mui/icons-material/Insights';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Stack } from '@mui/material';
import React from 'react';
import { CommandButton, SearchBox } from 'renderer/Components';
import CommandIconButton from 'renderer/Components/CommandIconButton';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import { useKeywordContext } from 'renderer/hooks';
import { GuiderStatus } from './ExposureStatusChip';

export default function ExposeButtons() {
  const [expTime, setExpTime] = React.useState<string>('15');
  const [isGuiding, setIsGuiding] = React.useState(false);
  const [isExposing, setIsExposing] = React.useState(false);

  const guiderKeywords = useKeywordContext();
  const { guider_status: guiderStatus, exposure_state: exposureState } =
    guiderKeywords;

  React.useEffect(() => {
    if (!guiderStatus) return;

    const bits: number = parseInt(guiderStatus.values[0] as string, 10);

    if (bits & GuiderStatus.IDLE) {
      setIsGuiding(false);
    } else {
      setIsGuiding(true);
    }
  }, [guiderStatus]);

  React.useEffect(() => {
    if (!exposureState || !exposureState.values[0].startsWith('gfa')) {
      setIsExposing(false);
      return;
    }

    if (exposureState.values[2] === 'idle') {
      setIsExposing(false);
    } else {
      setIsExposing(true);
    }
  }, [exposureState]);

  return (
    <Stack direction='row' spacing={2} alignSelf='center'>
      <SearchBox
        endAdornment={<span>sec</span>}
        defaultWidth={100}
        placeholder='Exp Time'
        value={expTime}
        onChange={(event) => setExpTime(event.target.value)}
      />
      <CommandWrapper
        commandString={`fliswarm talk -c gfa expose ${expTime}`}
        tooltip='Single exposure'
      >
        <CommandIconButton disabled={isExposing}>
          <PhotoCameraIcon fontSize='medium' />
        </CommandIconButton>
      </CommandWrapper>
      <CommandWrapper
        commandString={`cherno acquire -t ${expTime} -c`}
        isRunning={isGuiding}
        abortCommand='cherno stop'
        runningTooltip='Stop guiding'
      >
        <CommandButton variant='contained' endIcon={<InsightsIcon />}>
          Guide
        </CommandButton>
      </CommandWrapper>
    </Stack>
  );
}
