/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: logViewWithWindow.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Container, makeStyles, TextField, Typography } from '@material-ui/core';
import React, { memo } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';


const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    maxWidth: '100vw',
    padding: 0
  },
  logBox: {
    height: '100vh',
    width: '100vw',
    overflow: 'auto',
    whiteSpace: 'nowrap',
    display: 'flex',
    padding: '1px 8px 1px',
  },
  logLine: {
    fontSize: '14px'
  }
}));


interface RowInterface {
  [key: string]: any
}


function LogViewWithWindow() {

  const bottomRef = React.useRef<HTMLInputElement>(null);
  const classes = useStyles()
  const [lines, setLines] = React.useState<any>('');

  const parseLine = (line: string) => {
    setLines((lines: any) => [
      ...lines,
      <Typography className={classes.logLine} key={lines.length}>
        {line}
      </Typography>
    ]);
  }

  React.useEffect(() => {
    window.api.invoke('tron-add-streamer-window');
    window.api.on('tron-model-received-line', parseLine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Row = memo(({ data, index, style }: RowInterface) => {
    // Data passed to List as "itemData" is available as props.data
    const item = data[index];
    return (
      <div style={style} ref={index === data.length - 1 ? bottomRef : null}>
        {item}
      </div>
    );
  }, areEqual);

  return (
    <Container className={classes.container}>
      <Box component='div' className={classes.logBox}>
        <AutoSizer style={{ width: '100%', height: '100%' }}>
          {({ height, width }: any) => (
            <List height={height} itemCount={lines.length} itemData={lines}
              itemSize={22} width={width}>
              {Row}
            </List>
          )}
        </AutoSizer>
      </Box>

      <TextField variant='outlined' margin='none'
        fullWidth id='command' label='' name='command'
        autoFocus size='small' style={{ padding: '4px 8px 8px' }} />
    </Container>
  )
}


export default LogViewWithWindow;
