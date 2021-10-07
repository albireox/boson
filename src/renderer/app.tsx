/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-05
 *  @Filename: app.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect, useState } from 'react';
import './index.css';
import ViewManager from './viewManager';

function getBosonTheme(theme: string): {} {
  let muiTheme = {
    palette: {
      mode: theme
    },
    typography: {
      fontSize: 12
    }
  };

  return muiTheme;
}

export default function BosonApp() {
  // Initially set theme to dark, but it will be really set in the effect.
  const [theme, setTheme] = useState<string>('dark');

  useEffect(() => {
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
    <ThemeProvider theme={createTheme(getBosonTheme(theme))}>
      <CssBaseline />
      <ViewManager />
    </ThemeProvider>
  );
}
