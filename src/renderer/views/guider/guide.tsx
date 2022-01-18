/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: guide.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Stack } from '@mui/material';
import React from 'react';
import { CommandButton } from 'renderer/components/commandButton';
import { ValidatedNumberInput } from '../../components/validatedInput';

/** @jsxImportSource @emotion/react */

export const GuideStack = () => {
  const [expTime, setExpTime] = React.useState<number | undefined>(15);

  return (
    <Stack direction='row' pt={1} pb={1} spacing={1}>
      <ValidatedNumberInput
        label='Exposure Time'
        value={expTime}
        onChange={(e, value) => setExpTime(value)}
        startAdornment={<AccessTimeIcon />}
        endAdornment='s'
        sx={{ maxWidth: '120px' }}
      />
      <div css={{ flexGrow: 1 }} />
      <CommandButton
        commandString={`fliswarm talk -c gfa expose ${expTime || ''}`}
        endIcon={<CameraAltIcon fontSize='inherit' />}
      />
      <CommandButton
        commandString={`cherno acquire -c -t ${expTime || ''}`}
        abortCommand='cherno stop'
      >
        Guide
      </CommandButton>
    </Stack>
  );
};
