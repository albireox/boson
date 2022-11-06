/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: store.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Store from 'electron-store';
import default_config from './defaults.json';

// Define the store
const store = new Store({
  defaults: default_config,
});

export { store as default };
