/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: main.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { app, BrowserWindow, Menu, nativeTheme, screen } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import loadEvents from './events';
import menu from './menu';
import store from './store';

log.transports.console.level = false;

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

  store.set('user.defaultWindows', Array.from(windows.keys()));
}

export function createWindow(name: string = 'main'): BrowserWindow {
  // Create or show a new window

  if (name in windows.keys() && name !== 'log') {
    windows.get(name)!.show();
  }

  let configName: string;
  if (name === 'log') {
    let nLog = 0;
    for (let wName in windows) {
      if (wName.startsWith('log')) nLog++;
    }
    configName = name;
    name = name + (nLog + 1).toString();
  } else {
    configName = name;
  }

  let windowConfig: WindowConfig = store.get(`windows.${configName}`);
  windowConfig = windowConfig ? windowConfig : store.get(`windows.default`);

  // Checks if there are saved positions and, if so, overrides the config
  let customConfig: WindowConfig = store.get(`user.windows.${configName}`);
  if (customConfig) windowConfig = { ...windowConfig, ...customConfig };

  // Selects the screen to use (defaults to where the cursor is when the
  // app is launched). Otherwise uses the screen in which the main window
  // currently is.
  if (configName === 'main') {
    let cursor = screen.getCursorScreenPoint();
    let currentScreen = screen.getDisplayNearestPoint(cursor);
    windowConfig['x'] = (windowConfig['x'] || 0) + currentScreen.bounds.x;
    windowConfig['y'] = (windowConfig['y'] || 0) + currentScreen.bounds.y;
  } else {
    let mainPosition = mainWindow!.getPosition();
    if (!('center' in windowConfig)) {
      let mainScreen = screen.getDisplayNearestPoint({
        x: mainPosition[0],
        y: mainPosition[1]
      });
      windowConfig['x'] = (windowConfig['x'] || 0) + mainScreen.bounds.x;
      windowConfig['y'] = (windowConfig['y'] || 0) + mainScreen.bounds.y;
    }
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
      contextIsolation: true,
      nativeWindowOpen: true
    }
  });

  win.once('ready-to-show', () => {
    win?.show();
  });

  const isDev = require('electron-is-dev');

  if (isDev) {
    win.loadURL(`http://127.0.0.1:3000/${name}`);
  } else {
    win.loadURL(`file://${__dirname}/../../index.html?${name}`);
  }

  windows.set(name, win);

  win.on('closed', () => {
    win = null;
    windows.delete(name);
  });

  // Hot Reloading
  if (name === 'main') {
    if (isDev) {
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit'
      });

      // DevTools
      // const {
      //   default: installExtension,
      //   REACT_DEVELOPER_TOOLS
      // } = require('electron-devtools-installer');

      // installExtension(REACT_DEVELOPER_TOOLS)
      //   .then((name: string) => console.log(`Added Extension: ${name}`))
      //   .catch((err: Error) => console.log('An error occurred: ', err));

      // win.webContents.openDevTools();
    }

    loadEvents();
    log.info('Main window created.');
  } else {
    win.webContents.on('before-input-event', (event, input) => {
      if (input.meta && input.key.toLowerCase() === 'w') {
        win?.close();
        event.preventDefault();
      }
    });
  }

  return win;
}

app.on('ready', () => {
  for (let name of store.get('user.defaultWindows')) {
    let win = createWindow(name);
    if (name === 'main') {
      mainWindow = win;
      const isDev = require('electron-is-dev');

      if (!isDev && process.platform === 'darwin') {
        autoUpdater.allowPrerelease = true;

        const log = require('electron-log');
        log.transports.file.level = 'debug';
        autoUpdater.logger = log;

        autoUpdater.checkForUpdatesAndNotify();
      }
    }
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

app.on('before-quit', (e) => {
  saveWindowPositions();
});

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});
autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  console.log(log_message);
});
autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
});
