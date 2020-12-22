/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: preload.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { contextBridge, ipcRenderer } from 'electron';
import tron from './tron';


contextBridge.exposeInMainWorld(
    'electron',
    {
        ipcRenderer: ipcRenderer,
        tron: tron,
        store: {
            get: async (key: string) => await ipcRenderer.invoke('get-from-store', key)
        }
    }
);
