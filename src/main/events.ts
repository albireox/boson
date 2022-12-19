/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-23
 *  @Filename: events.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { exec } from 'child_process';
import { randomUUID } from 'crypto';
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  MessageBoxOptions,
  shell,
} from 'electron';
import * as keytar from 'keytar';
import { promisify } from 'util';
import { createWindow } from './main';
import store, { config, subscriptions as storeSubscriptions } from './store';
import connectAndAuthorise from './tron/tools';
import tron from './tron/tron';
import { CommandStatus } from './tron/types';

export default function loadEvents() {
  // app events
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:is-packaged', () => app.isPackaged);
  ipcMain.handle('app:new-window', async (event, name) => createWindow(name));
  ipcMain.handle('app:reload-window', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.reload();
  });
  ipcMain.handle('app:is-focused', async () => {
    return BrowserWindow.getAllWindows().some((win) => win.isFocused());
  });

  // tron
  ipcMain.handle('tron:get-status', () => tron.status);
  ipcMain.handle('tron:get-last-connected', () => tron.lastConnected);
  ipcMain.handle('tron:connect', () => tron.connect());
  ipcMain.handle('tron:disconnect', () => tron.disconnect());
  ipcMain.handle(
    'tron:connect-and-authorise',
    async (event, authorise = true, force = false) =>
      connectAndAuthorise({ authorise, force })
  );
  ipcMain.on('tron:get-credentials', async (event) => {
    event.returnValue = [
      tron.status,
      tron.user,
      tron.program,
      tron.host,
      tron.port,
    ];
  });
  ipcMain.handle('tron:subscribe', async (event) =>
    tron.subscribeWindow(event.sender)
  );
  ipcMain.handle('tron:unsubscribe', async (event) =>
    tron.unsubscribeWindow(event.sender)
  );
  ipcMain.handle(
    'tron:subscribe-keywords',
    async (event, keywords: string[], getKeys: boolean) =>
      tron.subscribeKeywordListener(event.sender, keywords, getKeys)
  );
  ipcMain.handle('tron:unsubscribe-keywords', async (event) =>
    tron.unsubscribeKeywordListener(event.sender)
  );
  ipcMain.handle('tron:all-replies', async (event, last?: number) =>
    tron.getReplies(last)
  );
  ipcMain.handle('tron:actors', async () => tron.getActors());
  ipcMain.handle('tron:get-all-keywords', async (_, keyword) => {
    return tron.trackedKeywordsAll.get(keyword) ?? [];
  });
  ipcMain.handle('tron:send', async (event, command: string, raise = false) => {
    const cmd = tron.sendCommand(command);

    await cmd.awaitUntilDone();
    delete cmd.lock; // Lock cannot be serialised and anyway it's not needed.

    if (cmd.status === CommandStatus.Failed && raise) {
      throw Error(`Command ${cmd.rawCommand} failed.`);
    }

    return cmd;
  });

  // store
  ipcMain.on('store:get', async (event, val: string, mode = 'normal') => {
    if (mode === 'normal') {
      event.returnValue = store.get(val, config[val as keyof typeof config]);
    } else if (mode === 'default') {
      event.returnValue = config[val as keyof typeof config] ?? undefined;
    } else if (mode === 'merge') {
      const def = config[val as keyof typeof config] ?? {};
      const user: { [key: string]: unknown } = store.get(val);
      event.returnValue = { ...def, ...user };
    } else {
      event.returnValue = undefined;
    }
  });
  ipcMain.handle('store:set', async (event, key, val) => {
    store.set(key, val);
  });
  ipcMain.handle('store:delete', async (event, key) => {
    store.delete(key);
  });
  ipcMain.handle('store:clear', async () => {
    store.clear();
  });
  ipcMain.handle(
    'store:subscribe',
    async (event, property, channel: string) => {
      const unsubscribe = store.onDidChange(
        property,
        (newValue) => event.sender && event.sender.send(channel, newValue)
      );
      storeSubscriptions.set(channel, unsubscribe);
    }
  );
  ipcMain.handle('store:unsubscribe', async (event, channel: string) => {
    const unsubscribe = storeSubscriptions.get(channel);
    if (unsubscribe) unsubscribe();
  });

  // keytar passwords
  ipcMain.handle('keytar:get', async (event, key) => {
    return keytar.getPassword('boson', key);
  });
  ipcMain.handle('keytar:set', async (event, key, value) => {
    keytar.setPassword('boson', key, value);
  });

  // tools
  ipcMain.on('tools:get-uuid', async (event) => {
    event.returnValue = randomUUID();
  });
  ipcMain.handle(
    'tools:open-in-application',
    async (event, command: string) => {
      const execP = promisify(exec);

      const { stdout, stderr } = await execP(command);

      if (stderr) {
        throw Error(stderr);
      }

      return stdout;
    }
  );
  ipcMain.handle('tools:open-in-browser', async (event, path: string) =>
    shell.openExternal(path)
  );

  // Dialogs
  ipcMain.handle(
    'dialog:show-message-box',
    async (event, options: MessageBoxOptions) => {
      const result = await dialog.showMessageBox(options);
      return result;
    }
  );
  ipcMain.handle(
    'dialog:show-error-box',
    async (event, title: string, content: string) => {
      await dialog.showErrorBox(title, content);
    }
  );
}
