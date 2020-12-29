/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-27
 *  @Filename: events.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { ipcMain } from 'electron';
import { windows } from './main';
import store from './store';
import { TronConnection } from './tron';

let tron = TronConnection.getInstance();

export default function loadEvents() {
  // Add events to ipcMain

  // Main
  ipcMain.handle('window-close', async (event, name) => {
    let win = windows[name];
    win.close();
  });

  ipcMain.handle('window-get-size', async (event, name) => {
    let win = windows[name];
    return win?.getSize();
  });

  ipcMain.handle('window-set-size', async (event, name, width, height, animate = false) => {
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

  ipcMain.handle('tron-authorise', async (event, credentials) => {
    return await tron.authorise(credentials);
  });

  ipcMain.handle('tron-add-streamer-window', async (event) => {
    tron.addStreamerWindow(event.sender.id);
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
}
