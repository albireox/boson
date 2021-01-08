/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-05
 *  @Filename: app.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Container,
  createMuiTheme,
  CssBaseline,
  makeStyles,
  ThemeProvider
} from '@material-ui/core';
import React from 'react';
import './index.css';
import ViewManager from './viewManager';

function getBosonTheme(theme: string): {} {
  let muiTheme = {
    palette: {
      type: theme
    },
    typography: {
      fontSize: 13
    }
  };

  return muiTheme;
}

const useStyles = makeStyles({
  container: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }
});

export default function BosonApp() {
  const classes = useStyles();

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
      <Container component='div' className={classes.container}>
        <ThemeProvider theme={createMuiTheme(getBosonTheme(theme))}>
          <CssBaseline />
          <ViewManager />
        </ThemeProvider>
      </Container>
    </React.Fragment>
  );
}
