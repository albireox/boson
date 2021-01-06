import { app, Menu, shell } from 'electron';
import { createWindow, saveWindowPositions } from './main';
import { TronConnection } from './tron';

const tron = TronConnection.getInstance();
const isMac = process.platform === 'darwin';

// Use any because Typescrip typing fails with ellipsis operator.
const template: any[] = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            {
              label: 'Connect ...',
              id: 'connect',
              accelerator: 'CmdOrCtrl+Shift+C',
              click: () => createWindow('connect')
            },
            {
              label: 'Disconnect',
              id: 'disconnect',
              click: () => tron.disconnect(),
              enabled: false
            },
            { type: 'separator' },
            {
              label: 'Save Window Positions',
              id: 'save-window-positions',
              click: () => saveWindowPositions()
            },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.exit(0) }
          ]
        }
      ]
    : []),
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
            }
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }])
    ]
  },
  {
    label: 'Utilities',
    submenu: [
      {
        label: 'Keyword Viewer',
        id: 'keywords',
        accelerator: 'CmdOrCtrl+Shift+K',
        click: () => createWindow('keywords')
      }
    ]
  },

  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
        : [{ role: 'close' }])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://electronjs.org');
        }
      }
    ]
  }
];

export default Menu.buildFromTemplate(template);
