/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: TypographyTitle.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Typography } from '@mui/material';
import React from 'react';

type PreferencesTypographyType = {
  children?: React.ReactNode;
};

type PreferencesTypographyTitleType = PreferencesTypographyType & {
  gutterBottom?: boolean;
};

export function TypographyTitle(props: PreferencesTypographyType) {
  const { children, gutterBottom = true } = props;

  return (
    <Typography
      variant='body2'
      fontSize={14}
      sx={(theme) => ({
        minWidth: '150px',
        color: theme.palette.text.primary,
        userSelect: 'none',
        alignSelf: 'center',
      })}
      gutterBottom={gutterBottom}
    >
      {children}
    </Typography>
  );
}

export function TypographyDescription(props: PreferencesTypographyType) {
  const { children } = props;

  return (
    <Typography variant='body2' color='text.secondary'>
      {children}
    </Typography>
  );
}
