/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: store.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Store from 'electron-store';
import EventEmitter from 'events';
import default_config from './defaults.json';
import user_config from './user.json';

// Define the store. Only load parameters that can be defined by the user.
// We also export the default config which is the one that won't change
// unless the version of boson changes.
const store = new Store({
  defaults: user_config,
  watch: true,
  migrations: {
    '>=0.2.0-beta.8': (st) => {
      st.set('guider.refreshInterval', 20);
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

export { store as default, default_config, subscriptions };
