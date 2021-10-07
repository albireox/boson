/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: guide.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import { Stack } from '@mui/material';
import React from 'react';
import { CommandButton } from 'renderer/components/commandButton';
import { ValidatedNumberInput } from '../../components/validatedInput';

/** @jsxImportSource @emotion/react */

export const GuideStack = () => {
  const [expTime, setExpTime] = React.useState<number | undefined>(undefined);
  const [stack, setStack] = React.useState<number | undefined>(undefined);
  const [selected, setSelected] = React.useState(false);

  return (
    <Stack direction='row' pt={1} pb={1} spacing={1}>
      <ValidatedNumberInput
        label='Exposure Time'
        value={expTime}
        onChange={(value) => setExpTime(value)}
        startAdornment={<AccessTimeIcon />}
        endAdornment='s'
        sx={{ maxWidth: '150px' }}
      />
      <ValidatedNumberInput
        label='Stack'
        value={stack}
        onChange={(value) => setStack(value)}
        startAdornment={<AutoAwesomeMotionIcon />}
        sx={{ maxWidth: '150px' }}
      />
      <div css={{ flexGrow: 1 }} />
      <CommandButton commandString='hub actors'>Guide</CommandButton>
    </Stack>
  );
};
