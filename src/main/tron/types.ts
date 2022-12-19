/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-06
 *  @Filename: types.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export enum ConnectionStatus {
  Disconnected = 1 << 0,
  Connecting = 1 << 1,
  Reconnecting = 1 << 2,
  Connected = 1 << 3,
  Authorising = 1 << 4,
  Authorised = 1 << 5,
  Failed = 1 << 6,
  TimedOut = 1 << 7,
  NoPassword = 1 << 8,
  AuthenticationFailed = 1 << 9,
  Ready = 1 << 10,
  Unknown = 1 << 11,
}

export interface Credentials {
  program: string;
  user: string;
  password: string;
}

export interface Keyword {
  name: string;
  commander: string | undefined;
  sender: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[];
}

export enum CommandStatus {
  Ready,
  Running,
  Failed,
  Done,
}

export enum ReplyCode {
  Started,
  Info,
  Error,
  Warning,
  Debug,
  Failed,
  Done,
  Running,
  Unknown,
}

export const ReplyCodeMap = new Map<ReplyCode, string>([
  [ReplyCode.Started, 's'],
  [ReplyCode.Info, 'i'],
  [ReplyCode.Error, 'e'],
  [ReplyCode.Warning, 'w'],
  [ReplyCode.Debug, 'd'],
  [ReplyCode.Failed, 'f'],
  [ReplyCode.Done, ':'],
  [ReplyCode.Running, '>'],
]);

export const ReplyCodeReverseMap = new Map<string, ReplyCode>([
  ['s', ReplyCode.Started],
  ['i', ReplyCode.Info],
  ['e', ReplyCode.Error],
  ['w', ReplyCode.Warning],
  ['d', ReplyCode.Debug],
  ['f', ReplyCode.Failed],
  [':', ReplyCode.Done],
  ['>', ReplyCode.Running],
]);
