/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-07
 *  @Filename: time.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import gpsTime from 'gps-time';

export function getTAITime() {
  // Add 315964800000 because this library uses midnight January 6, 1980 for
  // the GPS epoch and midnight January 1, 1970 for the Unix one.
  return new Date(gpsTime.toGPSMS(Date.now()) + 315964800000 + 19000);
}

export function getJD() {
  let unix = Date.now();
  return unix / 86400000 + 2440587.5;
}

export function getMJD(sjd = false) {
  let MJD = getJD() - 2400000.5;
  if (sjd) return Math.floor(MJD + 0.3);
  return Math.floor(MJD);
}

export function getLMST(lon = -105.820417) {
  let JD = getJD();
  let T = (JD - 2451545.0) / 36525;
  let theta0 =
    280.46061837 +
    360.98564736629 * (JD - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  let GMST = theta0 % 360;
  return (GMST + lon) / 15;
}
