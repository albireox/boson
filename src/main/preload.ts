/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: preload.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ConnectionStatus } from './tron';

export type Channels = 'tron:connection-status';

const ElectronAPI = {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: any[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: any[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: Channels, args: any[]) {
      return ipcRenderer.invoke(channel, args);
    },
    removeListener(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
  },
  app: {
    getVersion() {
      return ipcRenderer.invoke('app:get-version');
    },
    isPackaged() {
      return ipcRenderer.invoke('app:is-packaged');
    },
  },
  tron: {
    getStatus() {
      return ipcRenderer.invoke('tron:get-status');
    },
    getLastConnected() {
      return ipcRenderer.invoke('tron:get-last-connected');
    },
    connectAndAuthorise(): Promise<ConnectionStatus> {
      return ipcRenderer.invoke('tron:connect-and-authorise');
    },
    connect() {
      return ipcRenderer.invoke('tron:connect');
    },
    disconnect() {
      return ipcRenderer.invoke('tron:disconnect');
    },
  },
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('store:get', key);
    },
    set(property: string, val: any) {
      return ipcRenderer.send('store:set', property, val);
    },
  },
  keytar: {
    get(key: string) {
      return ipcRenderer.sendSync('keytar:get', key);
    },
    set(key: string, val: string) {
      return ipcRenderer.invoke('keytar:set', key, val);
    },
  },
};

contextBridge.exposeInMainWorld('electron', ElectronAPI);

export default ElectronAPI;
