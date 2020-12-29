/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Container, createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';
import * as serviceWorker from './serviceWorker';
import ViewManager from './viewManager';

// Add the contextBridge element to the window.
declare global {
  interface Window {
    api: any;
  }
}

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark'
  },
  typography: {
    fontSize: 12
  }
});

ReactDOM.render(
  <React.Fragment>
    <Container component='main' style={{ padding: 0 }}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <ViewManager />
      </ThemeProvider>
    </Container>
  </React.Fragment>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
