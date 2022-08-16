/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-05
 *  @Filename: app.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { useMemo } from 'react';
import './index.css';
import ConnectView from './views/connect';
import FocusMonitorView from './views/focus_monitor';
import FPSView from './views/FPS';
import GuiderView from './views/guider';
import HALView from './views/HAL';
import KeywordsView from './views/keywords';
import LampsView from './views/lamps';
import LogView from './views/log';
import MainView from './views/main';
import PreferencesView from './views/preferences';
import SnapshotsView from './views/snapshots';
import WeatherView from './views/weather';

function ViewManager() {
  const views: { [key: string]: JSX.Element } = {
    connect: <ConnectView />,
    fps: <FPSView />,
    guider: <GuiderView />,
    hal: <HALView />,
    keywords: <KeywordsView />,
    log: <LogView />,
    main: <MainView />,
    focus_monitor: <FocusMonitorView />,
    lamps: <LampsView />,
    preferences: <PreferencesView />,
    snapshots: <SnapshotsView />,
    weather: <WeatherView />
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
  let prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // For the snapshots window we prefer a light background always.
  if (
    window.location.pathname.includes('snapshots') ||
    window.location.search.slice(1) === 'snapshots'
  )
    prefersDarkMode = false;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light'
        },
        typography: {
          fontSize: 12
        },
        transitions: {
          duration: {
            shortest: 75,
            shorter: 100,
            short: 125,
            standard: 150,
            complex: 175,
            enteringScreen: 125,
            leavingScreen: 125
          }
        }
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ViewManager />
    </ThemeProvider>
  );
}
