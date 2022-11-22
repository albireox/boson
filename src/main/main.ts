/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

import { randomUUID } from 'crypto';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import * as keytar from 'keytar';
import path from 'path';
import MenuBuilder from './menu';
import store, { subscriptions as storeSubscriptions } from './store';
import { connectAndAuthorise } from './tron';
import tron from './tron/tron';
import { WindowParams } from './types';
import { resolveHtmlPath } from './util';

// For now disable log rotation
log.transports.file.maxSize = 0;

// Set up auto-updater
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const windows: { [key: string]: BrowserWindow | null } = { main: null };

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

function saveWindows() {
  return store.get('interface.saveWindows', true);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async (name: string) => {
  if (windows[name] !== undefined && windows[name] !== null) {
    const window = windows[name];
    window?.focus();
    return;
  }

  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  let windowParams: WindowParams = store.get(`windows.${name}`) || {};
  const savedWindowParams: WindowParams =
    store.get(`savedState.windows.${name}`) || {};

  if (saveWindows()) {
    windowParams = { ...windowParams, ...savedWindowParams };
  }

  const newWindow = new BrowserWindow({
    show: false,
    icon: getAssetPath('icon.png'),
    titleBarStyle: 'hidden',
    ...windowParams,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  windows[name] = newWindow;

  newWindow.loadURL(resolveHtmlPath(name));

  newWindow.on('ready-to-show', () => {
    if (!newWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    if (process.env.START_MINIMIZED) {
      newWindow.minimize();
    } else {
      newWindow.show();
    }

    const openWindows: string[] = store.get('savedState.windows.openWindows', [
      'main',
    ]);
    if (!openWindows.includes(name)) openWindows.push(name);
    store.set('savedState.windows.openWindows', openWindows);

    // Force devtools to not show up on start.
    // newWindow.webContents.closeDevTools();
  });

  newWindow.on('resized', () => {
    const size = newWindow.getSize();
    store.set(`savedState.windows.${name}.width`, size[0]);
    store.set(`savedState.windows.${name}.height`, size[1]);
  });

  newWindow.on('moved', () => {
    const position = newWindow.getPosition();
    store.set(`savedState.windows.${name}.x`, position[0]);
    store.set(`savedState.windows.${name}.y`, position[1]);
  });

  newWindow.on('closed', () => {
    windows[name] = null;
    const openWindows: string[] = store.get(
      'savedState.windows.openWindows',
      []
    );
    const newOpenWindows = openWindows.filter((value) => {
      return value === 'main' || value !== name;
    });
    setTimeout(
      () => store.set('savedState.windows.openWindows', newOpenWindows),
      3000
    );
  });

  if (name === 'main') {
    const menuBuilder = new MenuBuilder(newWindow);
    menuBuilder.buildMenu();
  }

  // Open urls in the user's browser
  newWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return {
      action: 'deny',
    };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  if (name === 'main') new AppUpdater();
};

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    let openWindows = ['main'];
    if (saveWindows()) {
      openWindows = store.get('savedState.windows.openWindows', ['main']);
    }

    openWindows.map((key) => createWindow(key));

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (windows.main === null) createWindow('main');
    });
  })
  .catch(console.log);

// app events
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:is-packaged', () => app.isPackaged);
ipcMain.handle('app:new-window', async (event, name) => createWindow(name));

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
ipcMain.handle('tron:subscribe', async (event) =>
  tron.subscribeWindow(event.sender)
);
ipcMain.handle('tron:unsubscribe', async (event) =>
  tron.unsubscribeWindow(event.sender)
);
ipcMain.handle('tron:send', async (event, command) => {
  const cmd = tron.sendCommand(command);
  await cmd.awaitUntilDone();
  return cmd;
});

// store
ipcMain.on('store:get', async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.handle('store:set', async (event, key, val) => {
  store.set(key, val);
});
ipcMain.handle('store:delete', async (event, key) => {
  store.delete(key);
});
ipcMain.handle('store:subscribe', async (event, property, channel: string) => {
  const unsubscribe = store.onDidChange(property, (newValue) =>
    event.sender.send(channel, newValue)
  );
  storeSubscriptions.set(channel, unsubscribe);
});
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
