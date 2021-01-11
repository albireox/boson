/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: async.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export class AsyncLock {
  // See https://medium.com/@chris_marois/asynchronous-locks-in-modern-javascript-8142c877baf

  disable = () => {};
  promise = Promise.resolve();

  enable() {
    this.promise = new Promise((resolve) => (this.disable = resolve));
  }
}
