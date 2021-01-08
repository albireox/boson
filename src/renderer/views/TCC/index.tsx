/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-01
 *  @Filename: tcc.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { darken, fade, lighten, styled } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import React, { Fragment } from 'react';
import { NetPosTable } from './netPos';

const TCCRule = styled('hr')(({ theme }) => ({
  border: 'none',
  height: '1px',
  backgroundColor:
    theme.palette.type === 'light'
      ? lighten(fade(theme.palette.divider, 1), 0.88)
      : darken(fade(theme.palette.divider, 1), 0.68),
  color:
    theme.palette.type === 'light'
      ? lighten(fade(theme.palette.divider, 1), 0.88)
      : darken(fade(theme.palette.divider, 1), 0.68)
}));

export const TCCTable = styled(Table)({
  margin: '4px 0px',
  width: '100%',
  '& > * > * > td': {
    fontSize: '14px',
    border: 'hidden',
    padding: '2px 4px',
    fontWeight: 400
  },
  '& > thead': {
    visibility: 'collapse'
  }
});

export default function TCCView() {
  return (
    <Fragment>
      <TCCRule />
      <NetPosTable />
      <TCCRule />
    </Fragment>
  );
}
