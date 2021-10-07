/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-02
 *  @Filename: keywords.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import { DataGrid, GridCellParams, GridColDef, GridRowData } from '@mui/x-data-grid';
import { KeywordMap } from 'main/tron';
import { useKeywords } from '../hooks';

function Sep(props: any) {
  return (
    <span style={{ color: 'gray', margin: '0px 8px' }} {...props}>
      |
    </span>
  );
}

const columns: GridColDef[] = [
  { field: 'actor', headerName: 'Actor', width: 120, sortable: true },
  { field: 'key', headerName: 'Key', width: 150, sortable: true },
  {
    field: 'value',
    headerName: 'Value',
    flex: 10,
    sortable: false,
    renderCell: (params: GridCellParams) => {
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
  { field: 'lastSeen', headerName: 'Last Seen', width: 200, sortable: true }
];

export default function KeywordsView() {
  const keywords = useKeywords(['*'], 'keyword-viewer');

  const formatRows = (kws: KeywordMap): GridRowData[] => {
    let result: GridRowData[] = [];
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
    <div
      css={{
        height: '100%',
        width: '100%',
        padding: '10px'
      }}
    >
      <DataGrid
        rows={formatRows(keywords)}
        columns={columns}
        disableSelectionOnClick
        density='compact'
      />
    </div>
  );
}
