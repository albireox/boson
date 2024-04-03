/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: actions.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { BrowserWindow } from 'electron';
import { store } from '../store';
import { tron } from '../tron/tron';
import { WindowParams } from '../types';

export function saveWindows() {
  const openWindows = BrowserWindow.getAllWindows();

  const windows: { [key: string]: WindowParams } = {};

  openWindows.forEach((win) => {
    const name = win.getTitle();

    const size = win.getSize();
    const position = win.getPosition();

    windows[name] = {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  });

  store.set('windows', windows);

  const openWindowsNames = openWindows.map((win) => win.getTitle());
  if (!openWindowsNames.includes('main')) {
    openWindowsNames.push('main');
  }
  store.set('windows.openWindows', openWindowsNames);
}

export function clearLogs() {
  // Sends an event to all windows asking them to clear their list of replies.
  // Also tell tron to clear its cache of replies.

  const channel = 'tron:clear-replies';

  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(channel);
  });

  tron.clearReplies();
}

export function reloadWindow() {
  const allWindows = BrowserWindow.getAllWindows();
  const focusedWindow = allWindows.find((win) => win.isFocused());

  if (!focusedWindow) return;

  focusedWindow.reload();
}
