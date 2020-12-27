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
import menu from './menu';
import store from './store';
import { TronConnection } from './tron';

require('v8-compile-cache');  // https://bit.ly/3mSfdBM


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';


type WindowType = BrowserWindow | null;

let windows: {[name: string]: BrowserWindow} = {};
let mainWindow: WindowType = null;

let tron = TronConnection.getInstance();


export function createWindow(name: string = 'main'): BrowserWindow {

  let windowConfig: object = store.get(`windows.${name}`);

  windowConfig = windowConfig !== undefined ? windowConfig : { width: 800, height: 600 };

  let win: WindowType = new BrowserWindow({
    ...windowConfig,
    show: false,
    backgroundColor: '#303030',
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true
    }
  })

  win.once('ready-to-show', () => {
    win?.show()
  });

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

      // DevTools
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension: ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

        win.webContents.openDevTools();
    }

  }

  // See https://stackoverflow.com/a/30132661. This seems to work better than ready-to-show.
  win.webContents.on('did-finish-load', function() {
    win?.show();
});

  return win
}

app.on('ready', () => {
  mainWindow = createWindow();
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


// ====== Event handling ======

// Main
ipcMain.handle('get-window-size', async (event, name) => {
  let win = windows[name];
  return win?.getSize();
});

ipcMain.handle('set-window-size', async (event, name, width, height, animate=false) => {
  let win = windows[name];
  if (win !== undefined) win.setSize(width, height, animate);
});

// Store
ipcMain.handle('get-from-store', async (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-in-store', async (event, key, value) => {
  return store.set(key, value);
});

// Tron
ipcMain.handle('tron-connect', async (event, host: string, port: number) => {
  return await tron.connect(host, port);
});

ipcMain.handle('tron-add-streamer-window', async (event) => {
  tron.model.addStreamerWindow(event.sender.id);
});
