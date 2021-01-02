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
import ViewManager from './viewManager';

// Add the contextBridge element to the window.
declare global {
  interface Window {
    api: any;
  }
}

function getBosonTheme(theme: string): {} {
  let muiTheme = {
    palette: {
      type: theme
    },
    typography: {
      fontSize: 12
    }
  };

  return muiTheme;
}

function BosonView() {
  // Initially set theme to dark, but it will be really set in the effect.
  const [theme, setTheme] = React.useState<string>('dark');

  React.useEffect(() => {
    // Listen to the toggle-theme event and switch the theme
    const updateTheme = async (useDarkTheme?: boolean) => {
      // If useDarkTheme is undefined, asks main.
      if (useDarkTheme === undefined) useDarkTheme = await window.api.invoke('theme-use-dark');
      if (useDarkTheme) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };
    window.api.on('theme-updated', updateTheme);
    updateTheme(); // Initial assignment
  }, []);

  return (
    <React.Fragment>
      <Container component='main' style={{ padding: 0 }}>
        <ThemeProvider theme={createMuiTheme(getBosonTheme(theme))}>
          <CssBaseline />
          <ViewManager />
        </ThemeProvider>
      </Container>
    </React.Fragment>
  );
}

ReactDOM.render(<BosonView />, document.getElementById('root'));
