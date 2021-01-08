/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-07
 *  @Filename: utils.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import gpsTime from 'gps-time';
import { sprintf } from 'sprintf-js';

export function getTAITime() {
  return new Date(gpsTime.toGPSMS(new Date()) + 19000);
}

export function degToDMS(
  deg: number | undefined | null,
  options?: { precision?: number; separator?: string; sign?: boolean }
): string | null {
  if (!deg && deg !== 0) return null;
  let precision = options?.precision || 2;
  let d = Math.floor(deg);
  let m = Math.floor((deg - d) * 60);
  let s = Math.floor(((deg - d) * 60 - m) * 60);
  return sprintf(
    `${options?.sign ? '+' : ''}%d%s%02d%s%0${precision + 3}.${precision}f`,
    d,
    options?.separator || ':',
    m,
    options?.separator || ':',
    s
  );
}
