/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: connection.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { createHash } from 'crypto';
import { app } from 'electron';
import log from 'electron-log';
import { Socket } from 'net';
import { arch, platform, release } from 'os';
import Command from './command';
import TronModel from './model';
import {
  Callback,
  ConnectionStatus,
  Credentials,
  Keyword,
  KeywordMap,
  Reply,
  ReplyCodeReverseMap
} from './types';

function evaluateKeyword(value: string) {
  switch (value) {
    case 'f' || 'F':
      return false;
    case 't' || 'T':
      return true;
    default:
      break;
  }
  if (!Number.isNaN(Number(value))) {
    return Number(value);
  } else {
    let match = value.match(/^["]+(.*?)["]+$|^(?!")(.+?)(?<!")$/);
    if (match) {
      return match[1] || match[2];
    }
    return value;
  }
}

const lineRegex = new RegExp(
  '(?<commander>(?:\\.?\\w+)+)\\s+' +
    '(?<commandId>\\d+)\\s+' +
    '(?<sender>\\w+)\\s+' +
    '(?<code>[diwfe:DIWFE>])\\s*' +
    '(?<keywords>.+)?'
);

function parseLine(line: string): [RegExpMatchArray | null, Keyword[]] {
  let keywords: Keyword[] = [];

  line = line.trim();
  if (!line) return [null, keywords];

  const lineMatched = line.match(lineRegex);
  if (!lineMatched || !lineMatched.groups) return [lineMatched, keywords];

  if (lineMatched.groups.keywords) {
    let sender = lineMatched.groups.sender;
    let actor: string = sender.includes('_') ? sender.split('_').slice(-1)[0] : sender;
    keywords = lineMatched.groups.keywords.split(/\s*;\s*/).map((kw: string) => {
      let key: string, values: string;
      let kwMatched = kw.trim().match(/(?<key>\w+)=(?<values>.+)/);
      if (!kwMatched) {
        // Case where the keyword does not have a value (e.g. loggedIn).
        key = kw;
        values = '';
      } else {
        key = kwMatched.groups!.key;
        values = kwMatched.groups!.values;
      }
      // Select all groups split by , except when the comma is inside quotes.
      let rawValues = values.matchAll(/[^,"']+|"([^"]*)"|'([^']*)'/g);
      let keyword: Keyword = {
        actor: actor,
        key: key,
        values: [...rawValues].map((value) => {
          return evaluateKeyword(value[0]);
        }),
        lastSeenAt: new Date()
      };
      return keyword;
    });
  }
  return [lineMatched, keywords];
}

export default class TronConnection {
  private static _instance: TronConnection;
  private _connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;
  private _subscribedWindows: Map<number, any> = new Map();
  private _replyCounter: number = 1;

  client = new Socket();

  stateCallbacks: Callback[] = [];

  model: TronModel;
  replies: Reply[] = [];
  jsonReplies: string[] = [];
  commands: { [commandId: number]: Command } = {};

  constructor() {
    this.client.on('connect', () => (this.status = ConnectionStatus.Connected));
    this.client.on('error', () => (this.status = ConnectionStatus.Failed));
    this.client.on('end', () => (this.status = ConnectionStatus.Disconnected));
    this.client.on('data', (buffer: Buffer) => this.parseData(buffer.toString()));
    this.model = new TronModel(this);
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
    this.stateCallbacks.forEach((cb) => cb(value));
  }

  registerCallback(cb: Callback) {
    if (!this.stateCallbacks.includes(cb)) {
      this.stateCallbacks.push(cb);
    }
  }

  async connect(host: string, port: number): Promise<ConnectionStatus> {
    log.info('User trying to connect to ', host, port);
    if (
      [
        ConnectionStatus.Connected,
        ConnectionStatus.Authorising,
        ConnectionStatus.Authorised
      ].includes(this.status)
    ) {
      log.info(`Already connected (${ConnectionStatus[this.status]})`);
      return this.status;
    }

    this.status = ConnectionStatus.Connecting;
    this.client.connect({ host: host, port: port });

    let elapsedTime = 0.0;
    while (elapsedTime < 5) {
      if (this.status !== ConnectionStatus.Connecting) {
        log.info('Connection finished with status', ConnectionStatus[this.status]);
        return this.status;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    this.status = ConnectionStatus.TimedOut;
    log.info('Connection finished with status', ConnectionStatus[this.status]);
    return this.status;
  }

  async authorise(credentials: Credentials) {
    log.info(`Trying to authorise user ${credentials.program.toUpperCase()}.${credentials.user}`);
    if (this.status === ConnectionStatus.Authorised) {
      log.info('Already authorised');
      return [true, null];
    } else if (this.status !== ConnectionStatus.Connected) {
      log.error('Not connected');
      return [false, 'Not connected'];
    }

    let initialStatus = this.status;
    this.status = ConnectionStatus.Authorising;

    let kkCommand = await this.sendCommand('auth knockKnock');

    if (kkCommand.didFail()) {
      let reason = kkCommand.replies[0].keywords['why'].values[0];
      log.error(`Failed getting nonce: ${reason}.`);
      this.status = initialStatus;
      return [false, `Failed: ${reason}`];
    }

    let nonce: string = kkCommand.replies[0].keywords['nonce'].values[0];
    log.debug(`Nonce received: ${nonce}`);

    let shasum = createHash('sha1');
    shasum.update(nonce + credentials.password);
    let authPassword = shasum.digest('hex');

    let authCommand =
      `auth login password=${authPassword} ` +
      `username="${credentials.user}" ` +
      `program="${credentials.program.toUpperCase()}" ` +
      `type=boson version=${app.getVersion()} ` +
      `platform="${platform()}-${release()}-${arch()}"`;

    let loginCommand = await this.sendCommand(authCommand);

    if (loginCommand.didFail()) {
      let reason = loginCommand.replies[0].keywords['why'].values[0];
      log.error(`Failed to log in: ${reason}.`);
      this.status = initialStatus;
      return [false, `Failed: ${reason}`];
    } else {
      log.info('Logging in complete.');
      this.status = ConnectionStatus.Authorised;
    }

    // Refresh keywords for all registered listeners.
    this.model.refreshKeywords();

    return [true, null];
  }

  disconnect() {
    this.client.end();
  }

  clear() {
    this.replies = [];
    this.jsonReplies = [];
  }

  async sendCommand(commandString: string) {
    let command = new Command(commandString);
    this.commands[command.commandId] = command;
    this.client.write(`${command.commandId} ${command.rawCommand}\r\n`);
    await command.waitUntilDone();
    return command;
  }

  addStreamerWindow(windowId: number, sender: any, sendAll = false): void {
    if (!this._subscribedWindows.has(windowId)) {
      this._subscribedWindows.set(windowId, sender);
      log.debug('Added listener', windowId);
      if (sendAll) {
        log.debug(`Sending ${this.jsonReplies.length} stored replies to listener ${windowId}`);
        this.sendReplyToListeners(this.jsonReplies, windowId);
      }
    }
  }

  removeStreamerWindow(windowId: number): void {
    if (this._subscribedWindows.has(windowId)) {
      log.debug('Removed listener', windowId);
      this._subscribedWindows.delete(windowId);
    }
  }

  sendReplyToListeners(reply: string[], windowId?: number): void {
    this._subscribedWindows.forEach((webContents, id) => {
      if (!windowId || windowId === id) {
        try {
          webContents.send('tron:model-received-reply', reply);
        } catch {
          log.debug('Failed sending message to listener', id);
          log.debug('Purging listener', id);
          this.removeStreamerWindow(id);
        }
      }
    });
  }

  parseData(data: string) {
    const newLines = data.trim().split(/\r/);
    const instantJSONReplies: string[] = [];

    for (let line of newLines) {
      let [lineMatched, keywords] = parseLine(line);

      if (!lineMatched || !lineMatched.groups) continue;

      let groups = lineMatched.groups;

      let reply: Reply = {
        id: this._replyCounter,
        date: new Date().toUTCString(),
        rawLine: line,
        commander: groups.commander,
        user: groups.user,
        commandId: parseInt(groups.commandId),
        sender: groups.sender,
        code: ReplyCodeReverseMap.get(groups.code.toLowerCase())!,
        keywords: Object.fromEntries(keywords.map((kw: Keyword) => [kw.key, kw])) as KeywordMap
      };

      for (let kw of keywords) {
        this.model.updateKeyword(kw);
      }

      if (reply.commandId in this.commands) {
        this.commands[reply.commandId].addReply(reply);
      }

      // this.replies.push(reply);
      // if (this.replies.length > 10000) {
      //   this.replies = this.replies.slice(-10000);
      // }

      // We convert to JSON now and store a list of JSON replies. That way,
      // when we open a new log window and have to send hundreds of thousands
      // of replies all at once, most of the serialisarion is already done and
      // the window doesn't hang waiting for main to serialise the replies.
      // Still, this is not ideal and we need a better solution.
      let jsonReply = JSON.stringify(reply);
      this.jsonReplies.push(jsonReply);
      instantJSONReplies.push(jsonReply);

      this._replyCounter++;
    }

    // Instead of sending the replies to the listeners one by one, we send
    // all the ones from this chunk of data at once. This seems to reduce
    // re-renders and improve performance a bit.
    this.sendReplyToListeners(instantJSONReplies);
  }
}
