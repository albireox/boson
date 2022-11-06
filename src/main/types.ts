/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: types.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable import/prefer-default-export */

export enum ConnectionStatus {
  Disconnected = 1 << 0,
  Connecting = 1 << 1,
  Reconnecting = 1 << 2,
  Connected = 1 << 3,
  Authorising = 1 << 4,
  Authorised = 1 << 5,
  Failed = 1 << 6,
  TimedOut = 1 << 7,
}

export type WindowParams = {
  width?: number;
  height?: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  x?: number;
  y?: number;
  closable: boolean;
  resizable: boolean;
};
