/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: logView.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Container, makeStyles, TextField, Typography } from '@material-ui/core';
import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';


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
    padding: '1px 8px 1px',
  },
  logLine: {
    overflow: 'auto',
    fontSize: '14px'
  }
}));


function LogView() {

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

  return (
    <Container className={classes.container}>
      <ScrollToBottom className={classes.logBox}>
        {lines}
      </ScrollToBottom>
      <TextField variant='outlined' margin='none'
        fullWidth id='command' label='' name='command'
        autoFocus size='small' style={{ padding: '4px 8px 8px' }} />
    </Container>
  )
}


export default LogView;
