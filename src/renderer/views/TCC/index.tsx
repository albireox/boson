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
import React from 'react';
import AxisStatus from './axisStatus';
import MiscTable from './misc';
import NetPosTable from './netPos';

export function Deg() {
  return (
    <span
      style={{
        fontSize: '16px',
        padding: '4px 0px 0px 0px',
        lineHeight: 0,
        display: 'block'
      }}
    >
      {'\u00b0'}
    </span>
  );
}

export function DMG() {
  return (
    <span
      style={{
        fontSize: '16px',
        padding: '4px 0px 0px 0px',
        lineHeight: 0,
        display: 'block'
      }}
    >
      {'\u00b0 \' "'}
    </span>
  );
}

const TCCRule = styled('hr')(({ theme }) => ({
  margin: '4px 0px',
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
  margin: 0,
  width: '100%',
  '& > * > * > td': {
    fontSize: '13px',
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
    <div>
      <TCCRule style={{ marginTop: '0px' }} />
      <NetPosTable />
      <TCCRule />
      <MiscTable />
      <TCCRule />
      <AxisStatus />
      <TCCRule />
    </div>
  );
}
