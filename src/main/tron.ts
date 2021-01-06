/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: tron.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { createHash } from 'crypto';
import { app, BrowserWindow } from 'electron';
import log from 'electron-log';
import { IpcMainInvokeEvent } from 'electron/main';
import { chunk as _chunk, pull as _pull } from 'lodash';
import { Socket } from 'net';
import { arch, platform, release } from 'os';

interface Callback {
  (event: ConnectionStatus): void;
}

export interface Keyword {
  actor: string;
  key: string;
  values: any[];
  lastSeenAt: Date;
}

export interface Reply {
  date: Date;
  rawLine: string;
  commander: string;
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
    let match = value.match(/^["]+(.+?)["]+$|^(?!")(.+?)(?<!")$/);
    if (match) {
      return match[1] || match[2];
    }
    return value;
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

export interface KeywordMap {
  [key: string]: Keyword;
}

/**
 * A class that represents the tron keyword model and emits events when a
 * keyword is updated.
 */
export class TronModel {
  /** A mapping of listeners to the list of keywords to which they
   * are subscibed. Key is in the form {actor}.{key}. Star wildcards can
   * be used for either actor or key, which will result in all the keywords
   * being forwarded. The listener is defined by the IpcMain event that
   * initiated it, and a string indicating the channel to which to send
   * the updates.
   */
  private _listeners: { [key: string]: [IpcMainInvokeEvent, string][] } = {};

  /** Map of key name to keyword object (includes value and last seen) */
  keywords: KeywordMap = {};

  /**
   * Initialises the tron model.
   * @param tron Tron connection
   */
  constructor(private tron: TronConnection) {}

  private _send(event: IpcMainInvokeEvent, channel: string, data: KeywordMap) {
    try {
      event.sender.send(channel, data);
    } catch (err) {
      log.error(`Failed sending message to (${event.sender.id}, ${channel})`);
    }
  }
  /**
   * Register a new listener for a key or group of keys.
   * @param keys Key or list of keys to monitor. Star wildcards can
   *    be used for either actor or key, which will result in all the
   *    keywords being forwarded.
   * @param event The event from which the request to add a new listener
   *    originates from. This is basically the window that sends the request.
   * @param channel A string with the name of the channel on which the
   *    renderer window will listen to.
   * @param now Whether to report the current value of the keyword immediately.
   * @param refresh If the value of the keyword has not been heard yet, forces
   *    and update from tron and reports the value. Note that if the key
   *    includes wildcards, this has no effect.
   */
  registerListener(
    keys: string | string[],
    event: IpcMainInvokeEvent,
    channel: string,
    now = true,
    refresh = false
  ) {
    if (!Array.isArray(keys)) keys = [keys];
    for (let key of keys) {
      // Checks that the key is *, actor.*, or actor.key.
      if (!key.match(/^\*|[a-z]+\.[a-z*]+$/i)) {
        log.error(`Cannot register a listener for key ${key}`);
        continue;
      }
      if (!(key in this._listeners)) {
        this._listeners[key] = [[event, channel]];
      } else {
        // Check if the window and channel are already registered.
        let alreadyRegistered = false;
        for (let [e, c] of this._listeners[key].values()) {
          if (e.sender.id === event.sender.id && c === channel) {
            alreadyRegistered = true;
            break;
          }
        }
        if (!alreadyRegistered) {
          this._listeners[key].push([event, channel]);
          log.debug(`Registering listener for ${key} on (${event.sender.id}, ${channel})`);
        }
      }
    }

    if (refresh) {
      this.refreshKeywords(keys);
    } else if (now) {
      let keysToSend: KeywordMap = {};
      for (let key of keys) {
        if ('*' === key) {
          keysToSend = this.keywords;
          break;
        } else if (key.includes('.*')) {
          let keyActor = key.split('.')[0];
          for (let kk in this.keywords) {
            let kkActor = kk.split('.')[0];
            if (kkActor === keyActor) keysToSend[kk] = this.keywords[kk];
          }
        } else {
          if (key in this.keywords) keysToSend[key] = this.keywords[key];
        }
      }
      log.debug(`Sending keys to (${event.sender.id}, ${channel}) NOW.`);
      this._send(event, channel, keysToSend);
    }
  }

  /**
   * Removes listener for a key or list of keys.
   * @param event The event that requests to remove the listener.
   * @param channel A string with the name of the channel on which the
   *    renderer window was listening to. If not specified, this effectively
   *    removes all the listeners for a window.
   */
  removeListener(event: IpcMainInvokeEvent, channel?: string) {
    for (let key in this._listeners) {
      for (let nn of this._listeners[key].keys()) {
        let listener = this._listeners[key][nn];
        if (listener[0].sender.id === event.sender.id) {
          if (channel && listener[1] !== channel) continue;
          if (this._listeners[key].length === 1) {
            delete this._listeners[key];
          } else {
            this._listeners[key].splice(nn);
          }
          log.debug(`Removing listener (${event.sender.id}, ${channel}).`);
        }
      }
    }
  }

  /**
   * Updates the keyword mapping.
   * @param kw The new keyword.
   */
  updateKeyword(kw: Keyword) {
    let fullKey = `${kw.actor}.${kw.key}`;
    this.keywords[fullKey] = kw;
    this.reportKeyword(kw.actor, kw.key);
  }

  /**
   * Reports a keyword to all subscribed callbacks.
   * @param actor Actor to which the key belongs.
   * @param key Key to report.
   */
  reportKeyword(actor: string, key: string) {
    // Get list of listened to keys, including wildcards, that match this key
    // and actor.
    let fullKey = `${actor}.${key}`;
    let validKeys = Object.keys(this._listeners).filter(
      (k) => k === '*' || k === fullKey || k === `${actor}.*`
    );
    // Report keyword to the selected listeners.
    validKeys.forEach((k) => {
      this._listeners[k].forEach(([event, channel]) => {
        this._send(event, channel, { [fullKey]: this.keywords[fullKey] });
      });
    });
  }

  /**
   * Asks tron to send the current values of a list of keys.
   * @param keys Keys to refresh.
   * @param maxChunk Maximum number of keys to ask for to tron at once.
   */
  refreshKeywords(keys: string[], maxChunk = 10) {
    // Remove keys that contain a wildcard. We cannot refresh them because
    // we don't have a full datamodel of the actor keys.
    keys = keys.filter((key) => !key.includes('*'));
    let actors = new Set(keys.map((k) => k.split('.')[0]));
    for (let actor of actors) {
      let actorKeys = keys.filter((k) => k.includes(`${actor}.`));
      if (actorKeys.length > maxChunk) {
        for (let ak of _chunk(actorKeys, maxChunk)) this.refreshKeywords(ak, maxChunk);
      } else {
        let keyNames = actorKeys.map((ak) => ak.split('.')[1]);
        let cmd = `keys getFor=${actor} ${keyNames.join(' ')}`;
        this.tron.sendCommand(cmd);
      }
    }
  }
}

export class TronConnection {
  private static _instance: TronConnection;
  private _connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;
  private _subscribedWindows: number[] = []; // window ids to which to send received lines

  client = new Socket();

  stateCallbacks: Callback[] = [];

  model: TronModel;
  replies: Reply[] = [];
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
      return [true, null];
    }
  }

  disconnect() {
    this.client.end();
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

  removeStreamerWindow(windowId: number): void {
    if (this._subscribedWindows.includes(windowId)) _pull(this._subscribedWindows, windowId);
  }

  parseData(data: string) {
    const newLines = data.trim().split(/\r/);

    for (let line of newLines) {
      let keywords: Keyword[] = [];

      line = line.trim();
      if (!line) continue;

      const lineMatched = line.match(
        /(?<commander>(\w*\.*)*\.\w+)\s+(?<commandId>\d+)\s+(?<sender>[\w|_]+)\s+(?<code>[d|i|w|f|e|:|D|I|W|F|E>])\s*(?<keywords>.+)?/
      );
      if (!lineMatched || !lineMatched.groups) continue;
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
          this.model.updateKeyword(keyword);
          return keyword;
        });
      }
      let reply: Reply = {
        date: new Date(),
        rawLine: line,
        commander: lineMatched.groups.commander,
        user: lineMatched.groups.user,
        commandId: parseInt(lineMatched.groups.commandId),
        sender: lineMatched.groups.sender,
        code: lineMatched.groups.code.toLowerCase() as any,
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
