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
import { ColDef, DataGrid, RowsProp, ValueFormatterParams } from '@material-ui/data-grid';
import React, { useEffect, useState } from 'react';
import { KeywordMap, Reply } from '../../electron/tron';

const columns: ColDef[] = [
  { field: 'actor', headerName: 'Actor', width: 120, sortDirection: 'asc' },
  { field: 'key', headerName: 'Key', width: 150 },
  {
    field: 'value',
    headerName: 'Value',
    flex: 10,
    renderCell: (params: ValueFormatterParams) => {
      let values = params.value as unknown[];
      let sep = <span style={{ color: 'gray' }}> | </span>;
      let formattedValues: any[] = [];
      for (let idx = 0; idx < values.length; idx++) {
        formattedValues.push(values[idx]);
        if (idx < values.length - 1) formattedValues.push(sep);
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

interface KeywordsMap {
  [key: string]: KeywordMap;
}

export default function KeywordsView() {
  const classes = useStyles();
  const [keywords, setKeywords] = useState<KeywordsMap>({});

  const formatRows = (kws: KeywordsMap): RowsProp => {
    let result: RowsProp = [];
    let id = 1;
    for (let sender in kws) {
      for (let kw of Object.values(kws[sender])) {
        result.push({
          id: id,
          actor: sender,
          key: kw.key,
          value: kw.values,
          lastSeen: kw.lastSeenAt.toISOString().split('T').join(' ')
        });
        id++;
      }
    }
    return result;
  };

  const parseReply = (reply: Reply) => {
    let senderUpdate = { ...keywords[reply.sender], ...reply.keywords };
    setKeywords({ ...keywords, ...{ [reply.sender]: senderUpdate } });
  };

  window.api.on('tron-model-received-reply', parseReply);

  useEffect(() => {
    // Initially, populate the keywords with all the values from the tron model.
    window.api.invoke('tron-model-getall').then((res: KeywordMap) => {
      let initialKws: KeywordsMap = {};
      for (let kw in res) {
        const [actor, key] = kw.split('.');
        if (actor in initialKws) {
          initialKws[actor][key] = res[kw];
        } else {
          initialKws[actor] = { [key]: res[kw] };
        }
      }
      setKeywords(initialKws);
    });

    const removeListener = () => window.api.invoke('tron-remove-streamer-window');

    window.api.invoke('tron-add-streamer-window');
    window.addEventListener('beforeunload', removeListener);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
