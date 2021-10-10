/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: index.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { IElectronAPI } from 'main/preload';
import ReactDOM from 'react-dom';
import BosonApp from './renderer/app';

// Add the contextBridge element to the window.
declare global {
  interface Window {
    api: IElectronAPI;
    JS9: any;
  }
}

ReactDOM.render(<BosonApp />, document.getElementById('root'));
