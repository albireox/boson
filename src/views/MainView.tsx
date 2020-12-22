/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: MainView.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Button, Grid, Paper } from '@material-ui/core';
import React from 'react';


let tron = window.electron.tron;

console.log(window.electron.store.get('windows'));


class LogWindow extends React.Component<{}, {connected: boolean, data: Array<string>}> {

  messagesEnd: any;

  constructor(props: {}) {
    super(props);
    this.connect = this.connect.bind(this)
    this.processData = this.processData.bind(this)
    this.messagesEnd = React.createRef();
    this.state = {connected: tron.connected, data: []};
  }

  processData(lines: string): void {
    let splitLines = lines.split(/\r?\n/)
    let newData = this.state.data.concat(splitLines)
    this.setState({data: newData})
  }

  componentDidUpdate() {
    this.messagesEnd.current.scrollIntoView();
  }

  connect() {
    tron.registerCallback('data', this.processData)
    tron.connect();
    this.setState({connected: tron.connected})
  }

  render() {
    return (
      <div>
      <Grid container spacing={1} direction="column" justify="flex-start" >
        <Grid item xs={12}>
          <Paper style={{padding: '10px', height: '75vh', overflow: 'auto', justifyContent: 'space-between'}}>
            {this.state.data.map((line) => <div>{line}</div>)}
            <div style={{ float:"left", clear: "both" }} ref={this.messagesEnd}>
        </div>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Button variant="contained" color="primary" onClick={this.connect}>
            Connect
          </Button>
        </Grid>
      </Grid>
      </div>
    )
  }

}

export default LogWindow;
