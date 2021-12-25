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
import ConnectView from './views/connect';
import FPSView from './views/FPS';
import GuiderView from './views/guider';
import HALView from './views/HAL';
import KeywordsView from './views/keywords';
import LogView from './views/log';
import MainView from './views/main';
import PreferencesView from './views/preferences';
import WeatherView from './views/weather';

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

function ViewManager() {
  const views: { [key: string]: JSX.Element } = {
    main: <MainView />,
    connect: <ConnectView />,
    log: <LogView />,
    keywords: <KeywordsView />,
    weather: <WeatherView />,
    fps: <FPSView />,
    guider: <GuiderView />,
    preferences: <PreferencesView />,
    hal: <HALView />
  };

  let path: string;

  if (window.location.search !== '') {
    // Production mode. The path is in the form ../index.html?<path>
    path = window.location.search.slice(1);
  } else {
    // Development mode. The path is in the form /albireox/boson/<path>
    path = window.location.pathname.split('/').reverse()[0];
  }

  if (path.startsWith('log')) {
    return views['log']; // We can have log1, log2, log3, etc.
  } else {
    return views[path];
  }
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
