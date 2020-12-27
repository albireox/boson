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
  ipcMain.handle('get-window-size', async (event, name) => {
    let win = windows[name];
    return win?.getSize();
  });

  ipcMain.handle('set-window-size', async (event, name, width, height, animate = false) => {
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

}
