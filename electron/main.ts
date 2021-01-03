/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: main.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { app, BrowserWindow, Menu, screen, nativeTheme } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import * as path from 'path';
import loadEvents from './events';
import menu from './menu';
import store from './store';
import log from 'electron-log';

log.transports.console.level = false;

require('v8-compile-cache'); // https://bit.ly/3mSfdBM

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

type WindowType = BrowserWindow | null;

interface WindowConfig {
  x: number;
  y: number;
}

export let windows = new Map<string, BrowserWindow>();
let mainWindow: WindowType = null;

export function saveWindowPositions() {
  // Stores the current positions and sizes of the open windows

  // TODO: We could also save the screen in which the window is.
  // If the screen is not present during restoration we can revert
  // to the primary or current screen.

  for (let [name, win] of windows) {
    // let win = windows.get(name);

    let winScreen = screen.getDisplayMatching(win.getBounds());
    let position = win.getPosition();

    store.set(`user.windows.${name}.x`, position[0] - winScreen.bounds.x);
    store.set(`user.windows.${name}.y`, position[1] - winScreen.bounds.y);

    if (win.isResizable()) {
      let size = win.getSize();
      store.set(`user.windows.${name}.width`, size[0]);
      store.set(`user.windows.${name}.height`, size[1]);
    }
  }
}

export function createWindow(name: string = 'main'): BrowserWindow {
  // Create or show a new window

  if (name in windows.keys()) {
    windows.get(name)!.show();
  }

  let windowConfig: WindowConfig = store.get(`windows.${name}`);
  windowConfig = windowConfig ? windowConfig : store.get(`windows.default`);

  // Checks if there are saved positions and, if so, overrides the config
  let customConfig: WindowConfig = store.get(`user.windows.${name}`);
  if (customConfig) windowConfig = { ...windowConfig, ...customConfig };

  // Selects the screen to use (defaults to where the cursor is when the
  // app is launched). Otherwise uses the screen in which the main window
  // currently is.
  if (name === 'main') {
    let cursor = screen.getCursorScreenPoint();
    let currentScreen = screen.getDisplayNearestPoint(cursor);
    windowConfig['x'] = (windowConfig['x'] || 0) + currentScreen.bounds.x;
    windowConfig['y'] = (windowConfig['y'] || 0) + currentScreen.bounds.y;
  } else {
    let mainPosition = mainWindow!.getPosition();
    let mainScreen = screen.getDisplayNearestPoint({ x: mainPosition[0], y: mainPosition[1] });
    windowConfig['x'] = (windowConfig['x'] || 0) + mainScreen.bounds.x;
    windowConfig['y'] = (windowConfig['y'] || 0) + mainScreen.bounds.y;
  }

  let win: WindowType = new BrowserWindow({
    ...windowConfig,
    titleBarStyle: 'hidden',
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#303030' : '#FFFFFF',
    useContentSize: true,
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true
    }
  });

  win.once('ready-to-show', () => {
    win?.show();
  });

  const isDev = require('electron-is-dev');

  if (isDev) {
    win.loadURL(`http://localhost:3000/index.html?${name}`);
  } else {
    win.loadURL(`file://${__dirname}/../index.html?${name}`);
  }

  windows.set(name, win);
  win.on('closed', () => {
    win = null;
    windows.delete(name);
  });

  // Hot Reloading
  if (name === 'main') {
    if (isDev) {
      // 'node_modules/.bin/electronPath'
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit'
      });

      // DevTools
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension: ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

      win.webContents.openDevTools();
    }

    loadEvents();
    log.info('Main window created.');
  }

  return win;
}

app.on('ready', () => {
  console.log(store.get('user.defaultWindows'));
  for (let name of store.get('user.defaultWindows')) {
    let win = createWindow(name);
    if (name === 'main') mainWindow = win;
  }
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
