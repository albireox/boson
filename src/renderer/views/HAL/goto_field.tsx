/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-10
 *  @Filename: goto_field.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Divider, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import MacroStepper from './macro_stepper';

/** @jsxImportSource @emotion/react */

export default function GotoFieldView(): JSX.Element | null {
  return (
    <Paper variant='outlined'>
      <Stack
        direction='column'
        divider={<Divider variant='middle' sx={{ opacity: 0.8 }} />}
        width='100%'
        p={1}
        px={2}
        spacing={1}
      >
        <Stack alignItems='center' direction='row' spacing={2}>
          <Typography variant='h6'>Goto Field</Typography>
        </Stack>
        <Stack alignItems='center' direction='row' spacing={2} overflow='scroll'>
          <MacroStepper macroName='goto_field' />
        </Stack>
      </Stack>
    </Paper>
  );
}
