/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: other.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Grid } from '@mui/material';
import React from 'react';

/** @jsxImportSource @emotion/react */

export default function OtherPreferences(): React.ReactElement {
  return (
    <Grid
      container
      columns={12}
      columnSpacing={2}
      rowSpacing={1}
      minWidth='500px'
      minHeight='200px'
      padding={4}
      justifyContent='center'
      alignItems='center'
    />
  );
}
