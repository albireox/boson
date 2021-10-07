/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-07
 *  @Filename: coords.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export function AltAzToHADec(alt: number, az: number, lat = 32.780361): [number, number] {
  let altRad = (alt * Math.PI) / 180;
  let azRad = ((-az + 180) * Math.PI) / 180;
  let latRad = (lat * Math.PI) / 180;

  let sinLatRad = Math.sin(latRad);
  let cosLatRad = Math.cos(latRad);

  let sinAltRad = Math.sin(altRad);
  let cosAltRad = Math.cos(altRad);

  let sinDec = sinLatRad * sinAltRad + cosLatRad * cosAltRad * Math.cos(azRad);
  let decRad = Math.asin(sinDec);

  let sinHA = -Math.sin(azRad) * cosAltRad;
  let cosHA = (sinAltRad - sinLatRad * sinDec) / cosLatRad;

  let HA = (Math.atan2(sinHA, cosHA) * 180) / Math.PI;

  return [HA, (decRad * 180) / Math.PI];
}
