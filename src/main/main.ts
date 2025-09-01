/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 **/

import {
  BrowserWindow,
  Notification,
  app,
  autoUpdater,
  dialog,
  nativeTheme,
  shell,
} from 'electron';
import log from 'electron-log';
import started from 'electron-squirrel-startup';
import path from 'path';
import { updateElectronApp } from 'update-electron-app';
import loadEvents from './events';
import MenuBuilder from './menu/menu';
import { config, store } from './store';
import { WindowNames, WindowParams } from './types';
import { resolveHtmlPath } from './utils';

// For now disable log rotation
log.transports.file.maxSize = 0;

// Set up auto-updater
updateElectronApp({ updateInterval: '10 minutes', logger: log });

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const windows = new Map<string, BrowserWindow | null>([['main', null]]);

const notifications: Notification[] = [];

function saveWindows() {
  const save = store.get('interface.saveWindows', true);
  const onlyOnRequest = store.get('interface.saveOnlyOnRequest', false);

  return save && !onlyOnRequest;
}

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

  let windowParams: WindowParams =
    config.windows[windowName.startsWith('log') ? 'log' : windowName] ?? {};

  const savedWindowParams: WindowParams = store.get(`windows.${name}`) || {};
  windowParams = { ...windowParams, ...savedWindowParams };
  // Create the browser window.
  const newWindow = new BrowserWindow({
    show: false,
    icon: '/public/icon.png',
    title: name,
    titleBarStyle: 'hidden',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#37393E' : '#FFFFFF',
    ...windowParams,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  newWindow.loadURL(resolveHtmlPath(name));

  windows.set(name, newWindow);

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

    // globalShortcut.register('Control+Shift+I', () => {
    //   // When the user presses Ctrl + Shift + I, this function will get called
    //   // You can modify this function to do other things, but if you just want
    //   // to disable the shortcut, you can just return false
    //   newWindow.webContents.openDevTools();
    // });
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
autoUpdater.on('error', (message) => {
  log.error('There was a problem updating the application');
  log.error(message);
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const notification = new Notification({
    title: 'Update available',
    body: `Boson ${releaseName} is now available.`,
    silent: false,
    actions: [
      { type: 'button', text: 'Install and Restart' },
      { type: 'button', text: 'Cancel' },
    ],
  });

  notification.on('action', (e, i) => {
    if (i === 0) autoUpdater.quitAndInstall();
  });

  notification.show();

  globalThis.manualUpdateCheckTriggered = false;
});

autoUpdater.on('update-not-available', () => {
  if (globalThis.manualUpdateCheckTriggered) {
    dialog.showMessageBox({
      message: 'You are up to date!',
      type: 'info',
      detail: `Boson ${app.getVersion()} is currently the newest version available.`,
    });
  }
  globalThis.manualUpdateCheckTriggered = false;
});
