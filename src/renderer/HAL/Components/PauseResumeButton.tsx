/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-12
 *  @Filename: PauseResumeButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { useKeywordContext } from 'renderer/hooks';

interface PauseResumeButtonProps {
  macro: string;
}

export default function PauseResumeButton(props: PauseResumeButtonProps) {
  const { macro } = props;

  const keywords = useKeywordContext();
  const { 'hal.expose_is_paused': isPausedKw } = keywords;

  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    setIsPaused(isPausedKw?.values[0] ?? false);
  }, [isPausedKw]);

  const handleClick = React.useCallback(() => {
    if (isPaused) {
      window.electron.tron.send(`hal ${macro} --resume`);
    } else {
      window.electron.tron.send(`hal ${macro} --pause`);
    }
  }, [macro, isPaused]);

  return (
    <Tooltip title={isPaused ? 'Resume macro' : 'Pause macro'}>
      <IconButton
        onClick={handleClick}
        disableFocusRipple
        disableTouchRipple
        disableRipple
      >
        {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
      </IconButton>
    </Tooltip>
  );
}
