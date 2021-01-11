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
import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams
} from '@material-ui/data-grid';
import { KeywordMap } from 'main/tron';
import { useKeywords } from '../hooks';

function Sep(props: any) {
  return (
    <span style={{ color: 'gray', margin: '0px 8px' }} {...props}>
      |
    </span>
  );
}

const columns: ColDef[] = [
  { field: 'actor', headerName: 'Actor', width: 120, sortDirection: 'asc' },
  { field: 'key', headerName: 'Key', width: 150 },
  {
    field: 'value',
    headerName: 'Value',
    flex: 10,
    renderCell: (params: ValueFormatterParams) => {
      let values = params.value as unknown[];
      let formattedValues: any[] = [];
      for (let idx = 0; idx < values.length; idx++) {
        formattedValues.push(values[idx]);
        if (idx < values.length - 1) {
          formattedValues.push(<Sep key={idx + 1} />);
        }
      }
      return <div>{formattedValues}</div>;
    }
  },
  { field: 'lastSeen', headerName: 'Last Seen', width: 200 }
];

const useStyles = makeStyles({
  root: {
    height: '100%',
    width: '100%',
    padding: '10px'
  },
  grid: {
    border: 0,
    '& .MuiDataGrid-window': {
      overflowX: 'hidden'
    }
  }
});

export default function KeywordsView() {
  const classes = useStyles();
  const keywords = useKeywords(['*']);

  const formatRows = (kws: KeywordMap): RowsProp => {
    let result: RowsProp = [];
    for (let kw in kws) {
      let kk = kws[kw];
      result.push({
        id: `${kk.actor}.${kk.key}`,
        actor: kk.actor,
        key: kk.key,
        value: kk.values,
        lastSeen: kk.lastSeenAt.toISOString().split('T').join(' ')
      });
    }
    return result;
  };

  return (
    <div className={classes.root}>
      <DataGrid
        rows={formatRows(keywords)}
        columns={columns}
        disableSelectionOnClick={true}
        className={classes.grid}
        showToolbar
        density='compact'
      />
    </div>
  );
}
