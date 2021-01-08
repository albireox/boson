/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-07
 *  @Filename: utils.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { sprintf } from 'sprintf-js';

export function degToDMS(
  deg: number | undefined | null,
  options?: { precision?: number; separator?: string; sign?: boolean; hours?: boolean }
): string | null {
  if (!deg && deg !== 0) return null;
  if (options?.hours) {
    deg /= 15;
  }
  let precision = options?.precision !== undefined ? options.precision : 2;
  let sign = options?.sign ? '+' : '';

  if (deg < 0) {
    sign = '-';
    deg = -deg;
  }

  let d = Math.trunc(deg);
  let m = Math.trunc((deg - d) * 60);
  let s = ((deg - d) * 60 - m) * 60;

  return sprintf(
    `%s%d%s%02d%s%0${precision === 0 ? 2 : precision + 3}.${precision}f`,
    sign,
    d,
    options?.separator || ':',
    m,
    options?.separator || ':',
    s
  );
}
