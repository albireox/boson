/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: store.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

 // Default values
import { ipcMain } from 'electron';
import defaults from './config.json';

const Store = require('electron-store');

// First get the store and update the defaults with any value already set.
// Then reset the store.
const store = new Store();

let config = {...defaults, ...store.get()}
store.set(config)


ipcMain.on('get-from-store', (event, key) => {
    return store.get(key);
})


export default store;
