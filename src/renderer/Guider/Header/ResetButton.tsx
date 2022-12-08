/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-28
 *  @Filename: ResetButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Tooltip } from '@mui/material';
import React from 'react';
import { HeaderIconButton } from 'renderer/Components';
import { GuiderRefMap } from '../Guider';

export interface ResetButtonProps {
  guiderRef: React.MutableRefObject<GuiderRefMap>;
}

export default function ResetButton(props: ResetButtonProps) {
  const { guiderRef } = props;

  const handleReset = React.useCallback(() => {
    if (!guiderRef.current) return;

    Object.values(guiderRef.current).forEach((element) => {
      element.reset();
    });
  }, [guiderRef]);

  return (
    <HeaderIconButton sx={{ px: 0 }} onClick={handleReset}>
      <Tooltip title='Reset all'>
        <RestartAltIcon />
      </Tooltip>
    </HeaderIconButton>
  );
}
