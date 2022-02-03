/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: preload.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { contextBridge, dialog, ipcRenderer, IpcRenderer } from 'electron';
import log from 'electron-log';
import { TronEventReplyIFace } from './events';
import store from './store';

// TODO: According to https://bit.ly/38aeKXB, we should not expose the ipcRenderer
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
    get_sync(key: string): any;
  };
  tron: {
    send(commandString: string, raise?: boolean): Promise<TronEventReplyIFace>;
  };
  openInBrowser(path: string): void;
  openInApplication(command: string): Promise<string>;
  dialog: {
    showMessageBox: typeof dialog.showMessageBox;
    showErrorBox(title: string, content: string): Promise<void>;
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
    get: async (key) => ipcRenderer.invoke('get-from-store', key),
    set: async (key, value) => ipcRenderer.invoke('set-in-store', key, value),
    get_sync: (key) => store.get(key)
  },
  tron: {
    send: async (commandString, raise = false) =>
      ipcRenderer.invoke('tron-send-command', commandString, raise)
  },
  openInBrowser: (path) => {
    require('electron').shell.openExternal(path);
  },
  openInApplication: async (command) => {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    const { stdout, stderr } = await exec(command);

    if (stderr) {
      throw Error(stderr);
    }

    return stdout;
  },
  dialog: {
    showMessageBox: async (options) => ipcRenderer.invoke('show-message-box', options),
    showErrorBox: async (title, content) => ipcRenderer.invoke('show-error-box', title, content)
  }
};

contextBridge.exposeInMainWorld('api', API);
