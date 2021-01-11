/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-27
 *  @Filename: events.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { ipcMain, Menu, nativeTheme } from 'electron';
import * as keytar from 'keytar';
import { createWindow, windows } from './main';
import store from './store';
import { ConnectionStatus } from './tron';
import TronConnection from './tron/connection';

let tron = TronConnection.getInstance();

export default function loadEvents() {
  // Add events to ipcMain

  // Main
  ipcMain.handle('window-open', async (event, name) => {
    createWindow(name);
  });

  ipcMain.handle('window-close', async (event, name) => {
    let win = windows.get(name)!;
    win.close();
  });

  ipcMain.handle('window-get-size', async (event, name) => {
    let win = windows.get(name)!;
    return win.getSize();
  });

  ipcMain.handle(
    'window-set-size',
    async (event, name, width, height, animate = false) => {
      let win = windows.get(name);
      if (win !== undefined) win.setSize(width, height, animate);
    }
  );

  // Store
  ipcMain.handle('get-from-store', async (event, key) => {
    if (Array.isArray(key)) return key.map((k) => store.get(k));
    return store.get(key);
  });

  ipcMain.handle('set-in-store', async (event, key, value) => {
    return store.set(key, value);
  });

  // keytar
  ipcMain.handle('get-password', async (event, service, account) => {
    return await keytar.getPassword(service, account);
  });

  ipcMain.handle('set-password', async (event, service, account, value) => {
    return await keytar.setPassword(service, account, value);
  });

  // Tron
  ipcMain.handle('tron-connect', async (event, host: string, port: number) => {
    return await tron.connect(host, port);
  });

  ipcMain.handle('tron-authorise', async (event, credentials) => {
    return await tron.authorise(credentials);
  });

  ipcMain.handle('tron-add-streamer-window', async (event) => {
    tron.addStreamerWindow(event.sender.id);
  });

  ipcMain.handle('tron-remove-streamer-window', async (event) => {
    tron.removeStreamerWindow(event.sender.id);
  });

  ipcMain.handle('tron-send-command', async (event, commandString: string) => {
    let command = await tron.sendCommand(commandString);
    return {
      rawCommand: command.rawCommand,
      commandId: command.commandId,
      status: command.status,
      replies: command.replies
    };
  });

  ipcMain.handle(
    'tron-register-model-listener',
    async (event, keys: string[], listenOn = 'tron-model-updated') => {
      tron.model.registerListener(keys, event, listenOn);
    }
  );

  ipcMain.handle(
    'tron-remove-model-listener',
    async (event, listenOn = 'tron-model-updated') => {
      tron.model.removeListener(event, listenOn);
    }
  );

  ipcMain.handle('tron-model-getall', async (event) => {
    return tron.model.keywords;
  });

  // Handle connect/disconnect from tron.
  function handleTronEvents(event: ConnectionStatus) {
    const menu = Menu.getApplicationMenu();
    const mainWindow = windows.get('main')!;
    if (event === ConnectionStatus.Authorised) {
      menu!.getMenuItemById('connect')!.enabled = false;
      menu!.getMenuItemById('disconnect')!.enabled = true;
    } else if (
      event === ConnectionStatus.Disconnected ||
      event === ConnectionStatus.Failed ||
      event === ConnectionStatus.TimedOut
    ) {
      menu!.getMenuItemById('connect')!.enabled = true;
      menu!.getMenuItemById('disconnect')!.enabled = false;
    }

    if (mainWindow) {
      mainWindow.webContents.send('tron-status', tron.status);
    }
  }

  tron.registerCallback(handleTronEvents);

  // Theme
  function reportTheme() {
    windows.forEach((win) =>
      win.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors)
    );
  }

  nativeTheme.on('updated', () => reportTheme());

  ipcMain.handle('theme-use-dark', () => {
    return nativeTheme.shouldUseDarkColors;
  });
}
