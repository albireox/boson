/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: preload.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { contextBridge, ipcRenderer, IpcRendererEvent, shell } from 'electron';
import { ConnectionStatus, Reply } from './tron/types';

const ElectronAPI = {
  ipcRenderer: {
    sendMessage(channel: string, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: string, func: (...args: any[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: string, func: (...args: any[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: string, args: any[]) {
      return ipcRenderer.invoke(channel, args);
    },
    removeListener(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
  app: {
    getVersion() {
      return ipcRenderer.invoke('app:get-version');
    },
    isPackaged() {
      return ipcRenderer.invoke('app:is-packaged');
    },
    openNewWindow(name: string) {
      return ipcRenderer.invoke('app:new-window', name);
    },
  },
  tron: {
    getStatus() {
      return ipcRenderer.invoke('tron:get-status');
    },
    getLastConnected() {
      return ipcRenderer.invoke('tron:get-last-connected');
    },
    connectAndAuthorise(
      authorise = true,
      force = false
    ): Promise<ConnectionStatus> {
      return ipcRenderer.invoke('tron:connect-and-authorise', authorise, force);
    },
    connect() {
      return ipcRenderer.invoke('tron:connect');
    },
    disconnect() {
      return ipcRenderer.invoke('tron:disconnect');
    },
    getCredentials(): Promise<
      [ConnectionStatus, string, string, string, number]
    > {
      return ipcRenderer.invoke('tron:get-credentials');
    },
    subscribe() {
      return ipcRenderer.invoke('tron:subscribe');
    },
    unsubscribe() {
      return ipcRenderer.invoke('tron:unsubscribe');
    },
    subscribeKeywords(
      channel: string,
      actor: string,
      keywords: string[],
      getKeys: boolean
    ) {
      return ipcRenderer.invoke(
        'tron:subscribe-keywords',
        channel,
        actor,
        keywords,
        getKeys
      );
    },
    unsubscribeKeywords(channel: string) {
      return ipcRenderer.invoke('tron:unsubscribe-keywords', channel);
    },
    getAllReplies(): Promise<Reply[]> {
      return ipcRenderer.invoke('tron:all-replies');
    },
    getActors(): Promise<string[]> {
      return ipcRenderer.invoke('tron:actors');
    },
    send(command: string) {
      return ipcRenderer.invoke('tron:send', command);
    },
  },
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('store:get', key);
    },
    set(property: string, val: any) {
      return ipcRenderer.invoke('store:set', property, val);
    },
    delete(key: string) {
      return ipcRenderer.invoke('store:delete', key);
    },
    subscribe(property: string, channel: string) {
      return ipcRenderer.invoke('store:subscribe', property, channel);
    },
    unsubscribe(channel: string) {
      return ipcRenderer.invoke('store:unsubscribe', channel);
    },
  },
  keytar: {
    get(key: string) {
      return ipcRenderer.invoke('keytar:get', key);
    },
    set(key: string, val: string) {
      return ipcRenderer.invoke('keytar:set', key, val);
    },
  },
  tools: {
    getUUID() {
      return ipcRenderer.sendSync('tools:get-uuid');
    },
    openInBrowser: (path: string) => {
      shell.openExternal(path);
    },
  },
};

contextBridge.exposeInMainWorld('electron', ElectronAPI);

export default ElectronAPI;
