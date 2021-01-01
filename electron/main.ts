/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: main.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { app, BrowserWindow, Menu } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import * as path from 'path';
import loadEvents from './events';
import menu from './menu';
import store from './store';

require('v8-compile-cache'); // https://bit.ly/3mSfdBM

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

type WindowType = BrowserWindow | null;

export let windows: { [name: string]: BrowserWindow } = {};
let mainWindow: WindowType = null;

export function createWindow(name: string = 'main'): BrowserWindow {
  // Create or show a new window

  let windowConfig: object = store.get(`windows.${name}`);
  windowConfig = windowConfig ? windowConfig : store.get(`windows.default`);

  if (name in windows) {
    windows[name].show();
  }

  let win: WindowType = new BrowserWindow({
    ...windowConfig,
    titleBarStyle: 'hidden',
    show: false,
    backgroundColor: '#303030',
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

  windows[name] = win;
  win.on('closed', () => {
    win = null;
    delete windows[name];
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
  }

  return win;
}

app.on('ready', () => {
  mainWindow = createWindow();
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
