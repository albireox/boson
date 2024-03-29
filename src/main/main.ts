/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

import {
  app,
  BrowserWindow,
  dialog,
  nativeTheme,
  Notification,
  shell,
} from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import loadEvents from './events';
import MenuBuilder from './menu/menu';
import { config, store } from './store';
import { WindowNames, WindowParams } from './types';
import { resolveHtmlPath } from './util';

// For now disable log rotation
log.transports.file.maxSize = 0;

// Set up auto-updater
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.allowDowngrade = false;
    autoUpdater.autoDownload = false;

    // GitHub does not allow channels. We use preRelease instead (this means
    // we only have two channels, stable and pre-release).
    autoUpdater.allowPrerelease = store.get('updateChannel') !== 'stable';
    autoUpdater.channel = 'latest';
  }
}

const windows = new Map<string, BrowserWindow | null>([['main', null]]);

const notifications: Notification[] = [];

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')({ showDevTools: false });
}

function saveWindows() {
  const save = store.get('interface.saveWindows', true);
  const onlyOnRequest = store.get('interface.saveOnlyOnRequest', false);

  return save && !onlyOnRequest;
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

function getLogWindowName() {
  let nn = 1;
  while (nn <= 100) {
    if (!windows.has(`log${nn}`)) return `log${nn}`;
    nn += 1;
  }
  log.warn('Maximum number of log windows reached.');
  return 'log1';
}

export async function createWindow(windowName: WindowNames) {
  let name: string;
  if (windowName === 'log') {
    name = getLogWindowName();
  } else {
    name = windowName;
  }

  if (windows.get(name) !== undefined && windows.get(name) !== null) {
    const window = windows.get(name);
    window?.focus();
    return;
  }

  // if (isDebug) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  let windowParams: WindowParams =
    config.windows[windowName.startsWith('log') ? 'log' : windowName] ?? {};

  const savedWindowParams: WindowParams = store.get(`windows.${name}`) || {};
  windowParams = { ...windowParams, ...savedWindowParams };

  const newWindow = new BrowserWindow({
    show: false,
    icon: getAssetPath('icon.png'),
    title: name,
    titleBarStyle: 'hidden',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#37393E' : '#FFFFFF',
    ...windowParams,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  windows.set(name, newWindow);

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

    if (saveWindows()) {
      const openWindows: string[] = store.get('windows.openWindows', ['main']);
      if (!openWindows.includes(name)) openWindows.push(name);
      store.set('windows.openWindows', openWindows);
    }

    // Force devtools to not show up on start.
    // newWindow.webContents.closeDevTools();

    // This won't show anything on the window itself, but that way we can
    // generate a list of window name to BrowserWindow anywhere.
    newWindow.setTitle(name);
  });

  newWindow.on('resized', () => {
    if (!saveWindows()) return;

    const size = newWindow.getSize();
    store.set(`windows.${name}.width`, size[0]);
    store.set(`windows.${name}.height`, size[1]);
  });

  newWindow.on('moved', () => {
    if (!saveWindows()) return;

    const position = newWindow.getPosition();
    store.set(`windows.${name}.x`, position[0]);
    store.set(`windows.${name}.y`, position[1]);
  });

  newWindow.on('closed', () => {
    windows.delete(name);

    if (saveWindows()) {
      const openWindows: string[] = store.get('windows.openWindows', []);
      const newOpenWindows = openWindows.filter((value) => {
        return value === 'main' || value !== name;
      });
      setTimeout(() => store.set('windows.openWindows', newOpenWindows), 3000);
    }
  });

  if (name === 'main') {
    const menuBuilder = new MenuBuilder(newWindow);
    menuBuilder.buildMenu();

    loadEvents();
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
}

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
    const openWindows: WindowNames[] = store.get('windows.openWindows', [
      'main',
    ]);
    openWindows.map((key) => createWindow(key));

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (windows.get('main') === undefined) createWindow('main');
    });
  })
  .catch(console.log);

// Auto-updater
autoUpdater.on('update-available', (info) => {
  // For now this can only get triggered if the menu bar
  // Check For Updated is used.

  const notification = new Notification({
    title: 'Update available',
    body: `Boson ${info.version} is now available.`,
    silent: false,
    actions: [
      { type: 'button', text: 'Install and Restart' },
      { type: 'button', text: 'Cancel' },
    ],
  });

  notification.on('action', (e, i) => {
    if (i === 0) autoUpdater.downloadUpdate();
  });

  notification.on('click', () => {
    dialog
      .showMessageBox({
        message: 'Update available',
        type: 'question',
        detail: 'Do you want to install this update now?',
        buttons: ['Yes', 'Not now'],
      })
      .then((response) => {
        if (response.response === 0) {
          autoUpdater.downloadUpdate();
        }
      })
      .catch(() => {});
  });

  notifications.push(notification); // To prevent GC from removing it.
  notification.show();
});

autoUpdater.on('update-downloaded', () => {
  // We only allow a download if we're ready to intall it, so go for it.
  autoUpdater.quitAndInstall();
});

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    message: 'You are up to date!',
    type: 'info',
    detail: `Boson ${app.getVersion()} is currently the newest version available.`,
  });
});
