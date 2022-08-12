/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: preload.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { contextBridge, dialog, ipcRenderer } from 'electron';
import log from 'electron-log';
import { TronEventReplyIFace } from './events';
import store from './store';
import { ConnectionStatus, KeywordMap } from './tron';

export interface IElectronAPI {
  log: log.LogFunctions;
  window: {
    open(name: string): Promise<void>;
    close(name: string): Promise<void>;
    getSize(name: string): Promise<number[]>;
    setSize(name: string, width: number, height: number, animate?: boolean): Promise<void>;
  };
  store: {
    get(key: string | string[]): Promise<any>;
    set(key: string, value: any): Promise<any>;
    get_sync(key: string): any;
  };
  password: {
    get(service: string, account: string): Promise<any>;
    set(service: string, account: string, value: any): Promise<void>;
  };
  tron: {
    send(commandString: string, raise?: boolean): Promise<TronEventReplyIFace>;
    simulateTronData(sender: string, line: string): Promise<void>;
    registerModelListener(keywords: string[], channel: string, refresh?: boolean): Promise<void>;
    removeModelListener(channel: string): Promise<void>;
    subscribe(channel: string, callback: (keywords: KeywordMap) => void): Promise<void>;
    addStreamerWindow(sendAll?: boolean): Promise<void>;
    removeStreamerWindow(): Promise<void>;
    connect(host: string, port: number): Promise<ConnectionStatus>;
    authorise(credentials: {
      program: string;
      user: string;
      password: string;
    }): Promise<[boolean, string | null]>;
    onStatus(callback: (status: ConnectionStatus) => void): Promise<void>;
    onModelReceivedReply(callback: (replies: string[]) => void): Promise<void>;
    onClearLogs(callback: () => void): Promise<void>;
  };
  openInBrowser(path: string): void;
  openInApplication(command: string): Promise<string>;
  dialog: {
    showMessageBox: typeof dialog.showMessageBox;
    showErrorBox(title: string, content: string): Promise<void>;
  };
}

const ElectronAPI: IElectronAPI = {
  log: log.functions,
  window: {
    open: async (name) => ipcRenderer.invoke('window:open', name),
    close: async (name) => ipcRenderer.invoke('window:close', name),
    getSize: async (name) => ipcRenderer.invoke('window:get-size', name),
    setSize: async (name, width, height, animate = false) =>
      ipcRenderer.invoke('window:set-size', name, width, height, animate)
  },
  store: {
    get: async (key) => ipcRenderer.invoke('store:get', key),
    set: async (key, value) => ipcRenderer.invoke('store:set', key, value),
    get_sync: (key) => store.get(key)
  },
  password: {
    get: async (service, account) => ipcRenderer.invoke('password:get', service, account),
    set: async (service, account, value) =>
      ipcRenderer.invoke('password:set', service, account, value)
  },
  tron: {
    send: async (commandString, raise = false) =>
      ipcRenderer.invoke('tron:send-command', commandString, raise),
    simulateTronData: async (sender, line) => {
      ipcRenderer.invoke('tron:simulate-data', sender, line);
    },
    registerModelListener: async (...args) =>
      ipcRenderer.invoke('tron:register-model-listener', ...args),
    removeModelListener: async (channel) =>
      ipcRenderer.invoke('tron:remove-model-listener', channel),
    subscribe: async (channel, callback) => {
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (event, keywords) => callback(keywords));
    },
    addStreamerWindow: async (sendAll = false) =>
      ipcRenderer.invoke('tron:add-streamer-window', sendAll),
    removeStreamerWindow: async () => ipcRenderer.invoke('tron:remove-streamer-window'),
    connect: async (host, port) => ipcRenderer.invoke('tron:connect', host, port),
    authorise: async (credentials) => ipcRenderer.invoke('tron:authorise', credentials),
    onStatus: async (callback) => {
      ipcRenderer.removeAllListeners('tron:status');
      ipcRenderer.on('tron:status', (event, status) => callback(status));
    },
    onModelReceivedReply: async (callback) => {
      ipcRenderer.removeAllListeners('tron:model-received-reply');
      ipcRenderer.on('tron:model-received-reply', (event, replies) => callback(replies));
    },
    onClearLogs: async (callback) => {
      ipcRenderer.removeAllListeners('tron:clear-logs');
      ipcRenderer.on('tron:clear-logs', (event) => callback());
    }
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

contextBridge.exposeInMainWorld('api', ElectronAPI);
