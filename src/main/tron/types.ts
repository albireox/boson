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
  date: string;
  rawLine: string;
  commander: string;
  user: string;
  sender: string;
  commandId: number;
  code: ReplyCode;
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

export enum ReplyCode {
  Info,
  Error,
  Warning,
  Debug,
  Failed,
  Done,
  Running,
  Unknown
}

export const ReplyCodeMap = new Map<ReplyCode, string>([
  [ReplyCode.Info, 'i'],
  [ReplyCode.Error, 'e'],
  [ReplyCode.Warning, 'w'],
  [ReplyCode.Debug, 'd'],
  [ReplyCode.Failed, 'f'],
  [ReplyCode.Done, ':'],
  [ReplyCode.Running, '>']
]);

export const ReplyCodeReverseMap = new Map<string, ReplyCode>([
  ['i', ReplyCode.Info],
  ['e', ReplyCode.Error],
  ['w', ReplyCode.Warning],
  ['d', ReplyCode.Debug],
  ['f', ReplyCode.Failed],
  [':', ReplyCode.Done],
  ['>', ReplyCode.Running]
]);
