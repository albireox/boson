/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: preload.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { contextBridge, ipcRenderer } from 'electron';
import { ConnectionStatus } from './tron';

contextBridge.exposeInMainWorld('api', {
  invoke: (channel: string, ...params: any) => {
    return ipcRenderer.invoke(channel, ...params);
  },
  on: (channel: string, listener: any) => {
    ipcRenderer.removeAllListeners(channel);
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },
  tron: {
    ConnectionStatus: ConnectionStatus,
  },
  store: {
    get: async (key: string) => await ipcRenderer.invoke('get-from-store', key),
    set: async (key: string, value: any) => await ipcRenderer.invoke('set-in-store', key, value),
  },
});
