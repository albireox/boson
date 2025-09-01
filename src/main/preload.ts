/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: preload.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  MessageBoxOptions,
  MessageBoxReturnValue,
} from 'electron';
import Command from './tron/command';
import Reply from './tron/reply';
import { ConnectionStatus, Keyword } from './tron/types';

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
    removeListener(channel: string, listener: (...args: any) => void) {
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
    reloadWindow() {
      return ipcRenderer.invoke('app:reload-window');
    },
    isFocused(): Promise<boolean> {
      return ipcRenderer.invoke('app:is-focused');
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
    getCredentials(): [ConnectionStatus, string, string, string, number] {
      return ipcRenderer.sendSync('tron:get-credentials');
    },
    subscribe() {
      return ipcRenderer.invoke('tron:subscribe');
    },
    unsubscribe() {
      return ipcRenderer.invoke('tron:unsubscribe');
    },
    subscribeKeywords(keywords: string[], getKeys: boolean) {
      return ipcRenderer.invoke('tron:subscribe-keywords', keywords, getKeys);
    },
    unsubscribeKeywords() {
      return ipcRenderer.invoke('tron:unsubscribe-keywords');
    },
    getAllReplies(last?: number): Promise<Reply[]> {
      return ipcRenderer.invoke('tron:all-replies', last);
    },
    getActors(): Promise<string[]> {
      return ipcRenderer.invoke('tron:actors');
    },
    getAllKeywords(keyword: string): Promise<Keyword[]> {
      return ipcRenderer.invoke('tron:get-all-keywords', keyword);
    },
    send(command: string, raise = false, internal = false): Promise<Command> {
      return ipcRenderer.invoke('tron:send', command, raise, internal);
    },
  },
  store: {
    get(key: string, mode: 'normal' | 'default' | 'merge' = 'normal') {
      return ipcRenderer.sendSync('store:get', key, mode);
    },
    set(property: string, val: any) {
      ipcRenderer.invoke('store:set', property, val);
    },
    delete(key: string) {
      ipcRenderer.invoke('store:delete', key);
    },
    clear() {
      ipcRenderer.invoke('store:clear');
    },
    subscribe(property: string, channel: string) {
      ipcRenderer.invoke('store:subscribe', property, channel);
    },
    unsubscribe(channel: string) {
      ipcRenderer.invoke('store:unsubscribe', channel);
    },
  },
  safe: {
    get(key: string) {
      return ipcRenderer.invoke('safe:get', key);
    },
    set(key: string, val: string) {
      return ipcRenderer.invoke('safe:set', key, val);
    },
  },
  tools: {
    getUUID() {
      return ipcRenderer.sendSync('tools:get-uuid');
    },
    openInBrowser: (path: string) => {
      return ipcRenderer.invoke('tools:open-in-browser', path);
    },
    openInApplication: (command: string) => {
      return ipcRenderer.invoke('tools:open-in-application', command);
    },
    playSound: (type: string) => {
      return ipcRenderer.invoke('tools:play-sound', type);
    },
    createLocalCopy: (path: string, name: string) => {
      return ipcRenderer.invoke('tools:create-local-copy', path, name);
    },
    verifySoundList: () => {
      return ipcRenderer.invoke('tools:verify-sound-list');
    },
  },
  dialog: {
    showMessageBox: async (
      options: MessageBoxOptions
    ): Promise<MessageBoxReturnValue> =>
      ipcRenderer.invoke('dialog:show-message-box', options),
    showErrorBox: async (title: string, content: string): Promise<void> =>
      ipcRenderer.invoke('dialog:show-error-box', title, content),
    listFiles: async (): Promise<void> =>
      ipcRenderer.invoke('dialog:list-files'),
  },
};

contextBridge.exposeInMainWorld('electron', ElectronAPI);

export default ElectronAPI;
