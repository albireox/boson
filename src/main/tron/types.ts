/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: types.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Command from './command';

export interface Callback {
  (event: ConnectionStatus): void;
}

export interface Keyword {
  actor: string;
  key: string;
  values: any[];
  lastSeenAt: Date;
}

export interface KeywordMap {
  [key: string]: Keyword;
}

export interface Reply {
  id: number;
  date: Date;
  rawLine: string;
  commander: string;
  user: string;
  sender: string;
  commandId: number;
  code: MessageCode;
  keywords: KeywordMap;
  command?: Command | undefined;
}

export interface Credentials {
  program: string;
  user: string;
  password: string;
}

export enum ConnectionStatus {
  Disconnected,
  Connecting,
  Connected,
  Authorising,
  Authorised,
  Failed,
  TimedOut
}

export enum CommandStatus {
  Ready,
  Running,
  Failed,
  Done
}

export enum MessageCode {
  Info = 'i',
  Error = 'e',
  Warning = 'w',
  Debug = 'd',
  Failed = 'f',
  Done = ':',
  Running = '>'
}
