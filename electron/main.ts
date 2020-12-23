/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: main.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import isDev from 'electron-is-dev';
import * as path from 'path';
import menu, { setMainWindow } from './menu';
import store from './store';


type WindowType = BrowserWindow | null;

let windows: {[name: string]: BrowserWindow} = {};
let mainWindow: WindowType = null;

export function createWindow(name: string = 'main'): BrowserWindow {

  let windowConfig: object = store.get(`windows.${name}`);

  windowConfig = windowConfig !== undefined ? windowConfig : { width: 800, height: 600 };

  let win: WindowType = new BrowserWindow({
    ...windowConfig,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true
    }
  })

  if (isDev) {
    win.loadURL(`http://localhost:3000/index.html?${name}`);
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html?${name}`);
  }

  windows[name] = win;
  win.on('closed', () => { win = null; delete windows[name]; });

  // Hot Reloading
  if (name === 'main') {
    if (isDev) {
      // 'node_modules/.bin/electronPath'
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit'
      });
    }

    // DevTools
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));

    // if (isDev) {
    //   win.webContents.openDevTools();
    // }
  }

  return win
}

app.on('ready', () => {
  mainWindow = createWindow();
  setMainWindow(mainWindow);
  Menu.setApplicationMenu(menu);
})

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


ipcMain.handle('get-window-size', async (event, name) => {
  let win = windows[name];
  return win?.getSize();
})

ipcMain.handle('set-window-size', async (event, name, width, height, animate=false) => {
  let win = windows[name];
  if (win !== undefined) win.setSize(width, height, animate);
})
