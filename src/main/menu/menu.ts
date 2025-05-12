/* eslint-disable import/no-cycle */

import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { createWindow } from '../main';
import { store } from '../store';
import {
  checkForUpdates,
  clearLogs,
  reloadWindow,
  saveWindows,
} from './actions';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Electron',
      submenu: [
        {
          label: 'About Boson',
          selector: 'orderFrontStandardAboutPanel:',
        },
        {
          label: 'Check for updates ... ',
          click: checkForUpdates,
        },
        { type: 'separator' },
        {
          label: 'Preferences ...',
          accelerator: 'Command+,',
          click: () => createWindow('preferences'),
        },
        { type: 'separator' },
        {
          id: 'mute-sounds',
          label: 'Mute sounds',
          type: 'checkbox',
          checked: store.get('audio.muted'),
          click: () => {
            const current = store.get('audio.muted') as boolean;
            store.set('audio.muted', !current);
          },
          accelerator: 'Command+Shift+M',
        },
        {
          label: 'Save window positions',
          click: saveWindows,
        },
        {
          label: 'Reload window',
          click: reloadWindow,
        },
        {
          label: 'Clear logs',
          click: clearLogs,
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide Boson',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            BrowserWindow.getFocusedWindow().setFullScreen(
              !BrowserWindow.getFocusedWindow().isFullScreen()
            );
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            BrowserWindow.getFocusedWindow().setFullScreen(
              !BrowserWindow.getFocusedWindow().isFullScreen()
            );
          },
        },
      ],
    };
    const subMenuTools: MenuItemConstructorOptions = {
      label: 'Tools',
      submenu: [
        {
          label: 'New log window ...',
          accelerator: 'Command+N',
          click: () => createWindow('log'),
        },
        { type: 'separator' },
        {
          label: 'Snapshots',
          accelerator: 'Command+Shift+S',
          click: () => createWindow('snapshots'),
        },
        {
          label: 'Guider',
          accelerator: 'Command+Shift+G',
          click: () => createWindow('guider'),
        },
        {
          label: 'Collimate',
          accelerator: 'Command+Shift+G',
          click: () => createWindow('collimate'),
        },
        {
          label: 'HAL',
          accelerator: 'Command+Shift+H',
          click: () => createWindow('HAL'),
        },
        {
          label: 'Chat',
          click: () => createWindow('chat'),
        },

        { type: 'separator' },
        {
          label: 'Focus plot',
          click: () => createWindow('focus_plot'),
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };

    // const subMenuView =
    //   process.env.NODE_ENV === 'development' ||
    //   process.env.DEBUG_PROD === 'true'
    //     ? subMenuViewDev
    //     : subMenuViewProd;
    const subMenuView = subMenuViewDev;

    return [
      subMenuAbout,
      subMenuEdit,
      subMenuView,
      subMenuTools,
      subMenuWindow,
    ];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              BrowserWindow.getFocusedWindow().close();
            },
          },
        ],
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    BrowserWindow.getFocusedWindow().webContents.reload();
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    BrowserWindow.getFocusedWindow().setFullScreen(
                      !BrowserWindow.getFocusedWindow().isFullScreen()
                    );
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
                  },
                },
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    BrowserWindow.getFocusedWindow().setFullScreen(
                      !BrowserWindow.getFocusedWindow().isFullScreen()
                    );
                  },
                },
              ],
      },
    ];

    return templateDefault;
  }
}
