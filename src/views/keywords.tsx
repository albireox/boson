/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-02
 *  @Filename: keywords.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { makeStyles } from '@material-ui/core';
import { ColDef, DataGrid, RowsProp } from '@material-ui/data-grid';

const rows: RowsProp = [
  { id: 1, col1: 'Hello', col2: 'World' },
  { id: 2, col1: 'XGrid', col2: 'is Awesome' },
  { id: 3, col1: 'Material-UI', col2: 'is Amazing' }
];

const columns: ColDef[] = [
  { field: 'actor', headerName: 'Actor', width: 150 },
  { field: 'key', headerName: 'Key', width: 150 },
  { field: 'value', headerName: 'Value', width: 300 }
];

const useStyles = makeStyles({
  root: {
    height: '100%',
    width: '100%',
    padding: '10px'
  },
  grid: {
    border: 0
  }
});

export default function KeywordsView() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <DataGrid rows={rows} columns={columns} className={classes.grid} />
    </div>
  );
}
