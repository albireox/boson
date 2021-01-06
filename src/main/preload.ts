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
import log from 'electron-log';
import { ConnectionStatus } from './tron';

// TODO: According to https://bit.ly/38aeKXB, we should to expose the ipcRenderer
// directly. Instead, we should expose the channels from events.ts here.

contextBridge.exposeInMainWorld('api', {
  log: log.functions,
  ipcRenderer: ipcRenderer,
  invoke: (channel: string, ...params: any) => {
    return ipcRenderer.invoke(channel, ...params);
  },
  send: (channel: string, ...params: any) => {
    return ipcRenderer.send(channel, ...params);
  },
  on: (channel: string, listener: any) => {
    ipcRenderer.removeAllListeners(channel);
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },
  tron: {
    ConnectionStatus: ConnectionStatus
  },
  store: {
    get: async (key: string) => await ipcRenderer.invoke('get-from-store', key),
    set: async (key: string, value: any) => await ipcRenderer.invoke('set-in-store', key, value)
  }
});
