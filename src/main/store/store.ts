/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: store.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Store from 'electron-store';
import EventEmitter from 'events';
import defaultConfig from './defaults.json';
import userConfig from './user.json';

// Define the store. Only load parameters that can be defined by the user.
// We also export the default config which is the one that won't change
// unless the version of boson changes.
const store = new Store({
  defaults: userConfig,
  watch: true,
  migrations: {
    '>=0.2.0-beta.8': (st) => {
      st.set('guider.refreshInterval', 20);
    },
    '>=0.2.0-beta.14': (st) => {
      st.set('log.saveState', true);
    },
    '>=0.2.1': (st) => {
      st.set('updateChannel', 'stable');
    },
    '>=0.3.0': (st) => {
      st.set('log.showInternal', false);
      st.set('log.highlightCommands', 'mine');
      st.set('hal.syncStages', false);
      st.set('hal.allowGotoFieldAutoMode', true);
      st.delete('hal.useAutoMode' as keyof typeof userConfig);
    },
    '>=0.3.3': (st) => {
      st.set('audio', {
        mode: 'on',
        muted: false,
        minimal: ['error'],
        sounds: {
          error: 'error.wav',
        },
      });
    },
  },
});

// Just a sanity check.
if (!store.get('windows.openWindows')) {
  store.set('windows.openWindows', ['main']);
}
if (!(store.get('windows.openWindows') as string[]).includes('main')) {
  store.set(
    'windows.openWindows',
    (store.get('windows.openWindows', []) as string[]).push('main')
  );
}

const subscriptions = new Map<string, () => EventEmitter>();

export { defaultConfig, store, subscriptions };