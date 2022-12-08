/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-28
 *  @Filename: ZoomButtons.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Stack, Tooltip } from '@mui/material';
import React from 'react';
import { HeaderIconButton } from 'renderer/Components';
import { GuiderRefMap } from '../Guider';

export interface ZoomButtonsProps {
  guiderRef: React.MutableRefObject<GuiderRefMap>;
}

export default function ZoomButtons(props: ZoomButtonsProps) {
  const { guiderRef } = props;

  const handleClick = React.useCallback(
    (direction: string) => {
      if (!guiderRef.current) return;

      Object.values(guiderRef.current).forEach((element) => {
        element.zoom(direction);
      });
    },
    [guiderRef]
  );

  return (
    <Stack direction='row' spacing={1.5}>
      <HeaderIconButton sx={{ px: 0 }} onClick={() => handleClick('toFit')}>
        <Tooltip title='Zoom to fit'>
          <FitScreenIcon />
        </Tooltip>
      </HeaderIconButton>
      <HeaderIconButton sx={{ px: 0 }} onClick={() => handleClick('out')}>
        <Tooltip title='Zoom out'>
          <RemoveCircleOutlineIcon />
        </Tooltip>
      </HeaderIconButton>
      <HeaderIconButton sx={{ px: 0 }} onClick={() => handleClick('in')}>
        <Tooltip title='Zoom in'>
          <AddCircleOutlineIcon />
        </Tooltip>
      </HeaderIconButton>
    </Stack>
  );
}
