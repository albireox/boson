/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: types.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { config } from './store';

/* eslint-disable import/prefer-default-export */

export type WindowParams = {
  width?: number;
  height?: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  x?: number;
  y?: number;
  closable?: boolean;
  resizable?: boolean;
  trafficLightPosition?: { x: number; y: number };
};

export type WindowNames = keyof (typeof config)['windows'];
