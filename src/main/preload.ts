/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: preload.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { contextBridge, ipcRenderer, IpcRenderer } from 'electron';
import log from 'electron-log';

// TODO: According to https://bit.ly/38aeKXB, we should to expose the ipcRenderer
// directly. Instead, we should expose the channels from events.ts here.

export interface IElectronAPI {
  log: log.LogFunctions;
  ipcRenderer: IpcRenderer;
  invoke(arg0: string, ...arg1: any): Promise<any>;
  send(arg0: string, ...arg1: any): void;
  on(arg0: string, listener: any): void;
  store: {
    get(key: string | string[]): Promise<any>;
    set(key: string, value: any): Promise<any>;
  };
}

const API: IElectronAPI = {
  log: log.functions,
  ipcRenderer: ipcRenderer,
  invoke: (channel, ...params) => {
    return ipcRenderer.invoke(channel, ...params);
  },
  send: (channel, ...params) => {
    return ipcRenderer.send(channel, ...params);
  },
  on: (channel, listener) => {
    ipcRenderer.removeAllListeners(channel);
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },
  store: {
    get: async (key) => await ipcRenderer.invoke('get-from-store', key),
    set: async (key, value) => await ipcRenderer.invoke('set-in-store', key, value)
  }
};

contextBridge.exposeInMainWorld('api', API);
