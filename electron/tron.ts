/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: tron.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { BrowserWindow } from 'electron';
import { Socket } from 'net';

interface Callback {
  (param?: any): void;
}

export interface Keyword {
  key: string;
  values: any[];
  lastSeenAt: Date;
}

export interface Reply {
  date: Date;
  rawLine: string;
  program: string | undefined;
  user: string;
  sender: string;
  commandId: number;
  code: 'd' | 'i' | 'w' | 'f' | 'e' | ':' | '>';
  keywords: { [key: string]: Keyword };
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

function evaluateKeyword(value: string) {
  try {
    // eslint-disable-next-line
    return eval(value);
  } catch (err) {
    switch (value) {
      case 'f' || 'F':
        return false;
      case 't' || 'T':
        return true;
      default:
        return value;
    }
  }
}

class AsyncLock {
  // See https://medium.com/@chris_marois/asynchronous-locks-in-modern-javascript-8142c877baf

  disable = () => {};
  promise = Promise.resolve();

  enable() {
    this.promise = new Promise((resolve) => (this.disable = resolve));
  }
}

export class Command {
  private static commandIdCounter = 0;
  private _lock = new AsyncLock();

  actor: string;
  command: string;
  commandId: number;
  status: CommandStatus = CommandStatus.Ready;

  replies: Reply[] = [];
  public readonly date = new Date();

  constructor(public rawCommand: string) {
    let chunks = rawCommand.trim().split(/\s+/);

    [this.actor, this.command] = chunks;
    Command.commandIdCounter += 1;
    this.commandId = Command.commandIdCounter;

    this._lock.enable();
  }

  isDone() {
    if (this.status === CommandStatus.Done || this.status === CommandStatus.Failed) {
      return true;
    }
    return false;
  }

  didFail() {
    if (this.status === CommandStatus.Failed) {
      return true;
    }
    return false;
  }

  async waitUntilDone() {
    await this._lock.promise;
  }

  addReply(reply: Reply) {
    this.replies.push(reply);
    switch (reply.code) {
      case 'f':
        this.status = CommandStatus.Failed;
        break;
      case 'e':
        this.status = CommandStatus.Failed;
        break;
      case ':':
        this.status = CommandStatus.Done;
        break;
      default:
        this.status = CommandStatus.Running;
        break;
    }
    if (this.isDone()) {
      this._lock.disable();
    }
  }
}

export class TronModel {
  keywords: { [key: string]: Keyword } = {};
}

export class TronConnection {
  private static _instance: TronConnection;
  private _connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;
  private _subscribedWindows: number[] = []; // window ids to which to send received lines

  client = new Socket();

  stateCallbacks: { [cbType: string]: Callback[] } = {};

  model = new TronModel();
  replies: Reply[] = [];
  commands: { [commandId: number]: Command } = {};

  constructor() {
    this.registerCallback('connect', () => {
      this.status = ConnectionStatus.Connected;
      console.log('Connected to tron.');
    });
    this.registerCallback('error', (err: any) => {
      this.status = ConnectionStatus.Failed;
      console.log(`TronConnection failed: ${err}.`);
    });
    this.registerCallback('end', (err: any) => {
      this.status = ConnectionStatus.Disconnected;
      console.log('Disconnected from tron.');
    });
    this.registerCallback('data', (buffer: Buffer) => {
      this.parseData(buffer.toString());
    });
  }

  public static getInstance(): TronConnection {
    if (!TronConnection._instance) {
      TronConnection._instance = new TronConnection();
    }

    return TronConnection._instance;
  }

  get status(): ConnectionStatus {
    return this._connectionStatus;
  }

  set status(value: ConnectionStatus) {
    this._connectionStatus = value;
  }

  registerCallback(cbType: string, cb: Callback) {
    if (cbType in this.stateCallbacks) {
      this.stateCallbacks[cbType].push(cb);
    } else {
      this.stateCallbacks[cbType] = [cb];
    }

    this.client.on(cbType, (...params) =>
      this.stateCallbacks[cbType].forEach((cb) => cb(...params))
    );
  }

  async connect(host: string, port: number): Promise<ConnectionStatus> {
    if (
      [
        ConnectionStatus.Connected,
        ConnectionStatus.Authorising,
        ConnectionStatus.Authorised
      ].includes(this.status)
    ) {
      return this.status;
    }

    this.status = ConnectionStatus.Connecting;
    this.client.connect({ host: host, port: port });

    let elapsedTime = 0.0;
    while (elapsedTime < 5) {
      if (this.status !== ConnectionStatus.Connecting) return this.status;
      await new Promise((r) => setTimeout(r, 50));
    }
    this.status = ConnectionStatus.TimedOut;
    return this.status;
  }

  async authorise(credentials: Credentials) {
    if (this.status === ConnectionStatus.Authorised) {
      throw new Error('Already authorised!');
    } else if (this.status !== ConnectionStatus.Connected) {
      throw new Error('Not connected');
    }

    this.status = ConnectionStatus.Authorised;
    let kkCommand = await this.sendCommand('auth knockKnock');
    if (kkCommand.didFail()) {
      throw new Error(`Failed: ${kkCommand.replies[0].keywords['why'].values[0]}`);
    }

    let nonce: string = kkCommand.replies[0].keywords['nonce'].values[0];

    let crypto = require('crypto');
    let shasum = crypto.createHash('sha1');
    shasum.update(nonce + credentials.password);
    let authPassword = shasum.digest('hex');

    let authCommand =
      `auth login password=${authPassword} ` +
      `user=${credentials.user} ` +
      `program=${credentials.program}`;

    let loginCommand = await this.sendCommand(authCommand);
    if (loginCommand.didFail()) {
      throw new Error(`Failed: ${loginCommand.replies[0].keywords['why'].values[0]}`);
    } else {
      this.status = ConnectionStatus.Authorised;
    }
  }

  disconnect() {
    this.client.destroy();
  }

  async sendCommand(commandString: string) {
    let command = new Command(commandString);
    this.commands[command.commandId] = command;
    this.client.write(`${command.commandId} ${command.rawCommand}\r\n`);
    await command.waitUntilDone();
    return command;
  }

  addStreamerWindow(windowId: number): void {
    if (!this._subscribedWindows.includes(windowId)) this._subscribedWindows.push(windowId);
  }

  parseData(data: string) {
    const newLines = data.split(/\r?\n/);

    for (let line of newLines) {
      let keywords: Keyword[] = [];

      line = line.trim();
      if (!line) continue;

      const matched = line.match(
        /(?<program>\w+)?.(?<user>\w+)\s+(?<commandId>\d+)\s+(?<sender>\w+)\s+(?<code>[d|i|w|f|e|:|>])\s*(?<keywords>.+)\s*/
      );
      if (!matched || !matched.groups) continue;

      if (matched.groups.keywords) {
        keywords = matched.groups.keywords.split(/\s*;\s*/).map((kw: string) => {
          let key: string, values: string;
          let matched = kw.trim().match(/(?<key>\w+)=(?<values>.+)/);
          if (!matched) {
            // Case where the keyword does not have a value (e.g. loggedIn).
            key = kw;
            values = 'T';
          } else {
            key = matched.groups!.key;
            values = matched.groups!.key;
          }
          let keyword: Keyword = {
            key: key,
            values: values.split(/\s*,\s*/).map((value: string) => {
              return evaluateKeyword(value);
            }),
            lastSeenAt: new Date()
          };
          this.model.keywords[key] = keyword;
          return keyword;
        });
      }
      let reply: Reply = {
        date: new Date(),
        rawLine: line,
        program: matched.groups.program,
        user: matched.groups.user,
        commandId: parseInt(matched.groups.commandId),
        sender: matched.groups.sender,
        code: matched.groups.code as any,
        keywords: Object.fromEntries(keywords.map((kw) => [kw.key, kw])) as any
      };

      if (reply.commandId in this.commands) {
        this.commands[reply.commandId].addReply(reply);
      }

      this.replies.push(reply);

      this._subscribedWindows.forEach((id) => {
        const webContents: any = BrowserWindow.fromId(id)?.webContents;
        webContents.send('tron-model-received-reply', reply);
      });
    }
  }
}
