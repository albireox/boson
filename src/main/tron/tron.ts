/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-03
 *  @Filename: tron.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { createHash } from 'crypto';
import { app, webContents, WebContents } from 'electron';
import log from 'electron-log';
import * as keytar from 'keytar';
import { Socket } from 'net';
import { arch, platform, release } from 'os';
import store, { config } from '../store';
import { generateName } from '../util';
import Command from './command';
import parseLine from './keywords';
import Reply from './reply';
import {
  ConnectionStatus,
  Keyword,
  ReplyCode,
  ReplyCodeReverseMap,
} from './types';

export class TronConnection {
  private connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;

  private commands: Map<number, Command> = new Map();

  private cmdsCommands: Map<number, [number, string, string, string]> =
    new Map();

  private loggers: Map<number, WebContents> = new Map();

  private keywordListeners: Map<string, [WebContents, string[]]> = new Map();

  private trackedKeywords: Map<string, Keyword | null> = new Map();

  private replies: Reply[] = [];

  private actors = new Set<string>([]);

  private client = new Socket();

  private maxLogMessages: number;

  host: string | undefined = undefined;

  port: number | undefined = undefined;

  user: string | undefined = undefined;

  program: string | undefined = undefined;

  lastConnected: Date | undefined = undefined;

  constructor() {
    this.maxLogMessages = store.get('maxLogMessages') ?? 50000;

    this.client.on('connect', () => {
      this.status = ConnectionStatus.Connected;
      log.info(`Connected to ${this.host}:${this.port}.`);
      if (this.isConnected()) this.lastConnected = new Date();
    });
    this.client.on('error', () => {
      log.info(`Connection to ${this.host}:${this.port} failed.`);
      this.status = ConnectionStatus.Disconnected | ConnectionStatus.Failed;
    });
    this.client.on('end', () => {
      log.info(`Connection to ${this.host}:${this.port} ended.`);
      this.status = ConnectionStatus.Disconnected;
    });
    this.client.on('data', (buffer: Buffer) =>
      this.parseData(buffer.toString())
    );

    this.initialiseKeywords();
  }

  private initialiseKeywords() {
    const { keywords } = config;
    keywords.forEach((keyword) => this.trackedKeywords.set(keyword, null));
  }

  get status(): ConnectionStatus {
    return this.connectionStatus;
  }

  set status(value: ConnectionStatus) {
    this.connectionStatus = value;
    webContents
      .getAllWebContents()
      .map((wc) => wc.send('tron:connection-status', value));
  }

  isConnected() {
    return !!(this.status & ConnectionStatus.Connected);
  }

  connect(host?: string, port?: number): ConnectionStatus {
    const newHost = host || (store.get('connection.host') as string);
    const newPort = port || (store.get('connection.port') as number);

    log.info('User trying to connect to ', newHost, newPort);
    if (this.isConnected()) {
      log.info(`Already connected (${ConnectionStatus[this.status]})`);
      return this.status;
    }

    this.user = undefined;
    this.program = undefined;

    this.host = newHost;
    this.port = newPort;

    this.status |= ConnectionStatus.Connecting;
    this.client.connect({ host: newHost, port: newPort });

    return this.status;
  }

  async authorise(
    user_?: string,
    program_?: string
  ): Promise<[boolean, string | null]> {
    const program = program_ ?? store.get('connection.program');
    if (!program) return [false, 'Program not found.'];

    const password = await keytar.getPassword('boson', program);

    if (!password) {
      this.connectionStatus |=
        ConnectionStatus.NoPassword | ConnectionStatus.AuthenticationFailed;
      this.disconnect();
      return [false, null];
    }

    let user = user_ ?? store.get('connection.user');

    if (user === undefined || user.trim() === '') {
      user = generateName();
    }

    log.info(`Trying to authorise user ${program.toUpperCase()}.${user}`);

    if (this.status & ConnectionStatus.Authorised) {
      log.info('Tron already authorised');
      return [true, null];
    }

    if (!(this.status & ConnectionStatus.Connected)) {
      log.error('Tron cannot authorise: not connected');
      return [false, 'Not connected'];
    }

    this.status |= ConnectionStatus.Authorising;

    const kkCommand = this.sendCommand('auth knockKnock');
    await kkCommand.awaitUntilDone();

    if (kkCommand.didFail()) {
      const reason = (kkCommand.replies[0].get('why')?.values[0] ??
        'unknown') as string;
      log.error(`Failed getting nonce: ${reason}.`);
      this.connectionStatus |= ConnectionStatus.AuthenticationFailed;
      this.disconnect();
      return [false, reason];
    }

    const nonceKw = kkCommand.replies[0].get('nonce');
    if (nonceKw === undefined) {
      const reason = 'Nonce not received.';
      log.error(`Failed getting nonce: ${reason}.`);
      this.connectionStatus |= ConnectionStatus.AuthenticationFailed;
      this.disconnect();
      return [false, reason];
    }

    const nonce = nonceKw.values[0] as string;
    log.debug(`Nonce received: ${nonce}`);

    const shasum = createHash('sha1');
    shasum.update(nonce + password);
    const authPassword = shasum.digest('hex');

    const authCommand =
      `auth login password=${authPassword} ` +
      `username="${user}" ` +
      `program="${program.toUpperCase()}" ` +
      `type=boson version=${app.getVersion()} ` +
      `platform="${platform()}-${release()}-${arch()}"`;

    const loginCommand = this.sendCommand(authCommand);
    await loginCommand.awaitUntilDone();

    if (loginCommand.didFail()) {
      const reason = (loginCommand.replies[0].get('why')?.values[0] ??
        'unknown') as string;
      log.error(`Failed to log in: ${reason}.`);
      this.connectionStatus |= ConnectionStatus.AuthenticationFailed;
      this.disconnect();
      return [false, reason];
    }

    log.info('Logging in complete.');
    this.user = user;
    this.program = program;
    this.status =
      ConnectionStatus.Connected |
      ConnectionStatus.Authorised |
      ConnectionStatus.Ready;

    return [true, null];
  }

  disconnect() {
    log.info("Disconnecting at user's request");

    this.client.destroy();
    this.connectionStatus &= ~(
      ConnectionStatus.Authorised |
      ConnectionStatus.Authorising |
      ConnectionStatus.Connected |
      ConnectionStatus.Connecting
    );
    this.status = this.connectionStatus | ConnectionStatus.Disconnected;
  }

  sendCommand(commandString: string) {
    const command = new Command(commandString);
    this.commands.set(command.commandId, command);

    // Remove command from TronConnection list when done.
    command.lock?.promise?.then((value) => {
      this.commands.delete(value.commandId);
      return null;
    });

    // Write to socket.
    this.client.write(`${command.commandId} ${command.rawCommand}\r\n`);

    return command;
  }

  parseData(data: string) {
    const CmdQueuedRegex = new RegExp(
      'CmdQueued=([0-9]+),([0-9.]+),"(.+?)",([0-9]+),"(.+?)",([0-9]+),"(.+?)"'
    );

    const newLines = data.trim().split(/\r|\n/);

    newLines.forEach((line) => {
      const [lineMatched, keywords] = parseLine(line);

      if (!lineMatched || !lineMatched.groups) return;

      const { groups } = lineMatched;
      let rawLine = line;

      // In the log windows we want to colour the start and end of a command
      // and for that we rely on cmds, but CmdDone does not have all the
      // information, only the internal tron ID. When a command is queued
      // we grab that information from CmdQueued and then attach it to CmdDone.
      if (groups.sender === 'cmds') {
        if (line.includes('CmdQueued')) {
          const cmdsMatch = line.match(CmdQueuedRegex);
          if (cmdsMatch) {
            const tronId = parseInt(cmdsMatch[1], 10);
            const cmdId = parseInt(cmdsMatch[4], 10);
            this.cmdsCommands.set(tronId, [
              cmdId,
              cmdsMatch[3], // user that commanded this command
              cmdsMatch[5], // actor being commanded
              cmdsMatch[7], // command sent to the actor
            ]);
            groups.code = 's'; // started. This is not a standard tron code.
          }
        } else if (line.includes('CmdDone')) {
          const cmdsMatch = line.match(/CmdDone=([0-9]+),"([:f])"/);
          if (cmdsMatch) {
            const tronId = parseInt(cmdsMatch[1], 10);
            const doneCode = cmdsMatch[2];
            if (this.cmdsCommands.has(tronId)) {
              const [cmdId, fromWhom, toActor, cmd] =
                this.cmdsCommands.get(tronId) ?? [];
              groups.code = doneCode; // Change its code to the command result.
              rawLine += `,${cmdId},"${fromWhom}","${toActor}","${cmd}"`;
            }
          }
        }
      }

      const reply = new Reply(
        rawLine,
        groups.commander,
        groups.sender,
        parseInt(groups.commandId, 10),
        ReplyCodeReverseMap.get(groups.code.toLowerCase()) ?? ReplyCode.Unknown,
        keywords
      );

      this.replies = this.replies.slice(-this.maxLogMessages);
      this.replies.push(reply);

      this.actors.add(reply.sender);
      if (
        reply.sender === 'hub' &&
        reply.keywords.length > 0 &&
        reply.keywords[0].name === 'Actors'
      ) {
        reply.keywords[0].values.forEach((actor) => this.actors.add(actor));
      }

      this.commands.get(reply.commandId)?.addReply(reply);

      this.loggers.forEach((win) => win.send('tron:received-reply', reply));

      this.processReply(reply);
    });
  }

  getReplies() {
    return this.replies;
  }

  getActors() {
    return this.actors;
  }

  subscribeWindow(sender: WebContents) {
    const { id } = sender;
    if (sender.isDestroyed()) {
      this.unsubscribeWindow(sender);
      return;
    }
    if (this.loggers.has(id)) {
      log.warn(`Window ${id} is already subscribed.`);
      return;
    }
    this.loggers.set(id, sender);
    log.info(
      `Window ${id} has been subscribed. ` +
        `${this.loggers.size} loggers connected.`
    );
  }

  unsubscribeWindow(sender: WebContents) {
    const { id } = sender;
    if (!this.loggers.has(id)) {
      log.warn(`Window ${id} is not subscribed.`);
      return;
    }
    this.loggers.delete(id);
    log.info(
      `Window ${id} has been unsubscribed. ` +
        `${this.loggers.size} loggers still connected.`
    );
  }

  async subscribeKeywordListener(
    sender: WebContents,
    channel: string,
    actor: string,
    keywords: string[],
    getKeys = true
  ) {
    const keys = keywords.map((keyword) => `${actor}.${keyword}`);
    this.keywordListeners.set(channel, [sender, keys]);

    const untracked: string[] = [];

    keys.forEach((key, idx) => {
      const trackedKeyword = this.trackedKeywords.get(key);
      if (!trackedKeyword) {
        this.trackedKeywords.set(key, null);
        untracked.push(keywords[idx]);
      } else {
        this.emitKeyword(key, trackedKeyword);
      }
    });

    if (getKeys && untracked.length > 0) {
      const { replies } = await this.sendCommand(
        `keys getFor=${actor} ${untracked.join(' ')}`
      ).awaitUntilDone();
      if (replies.length > 0) {
        replies.every((reply) => {
          if (reply.code !== ReplyCode.Info) return true;

          // Change sender so that it will appear as if coming from the actor.
          reply.sender = actor;
          this.processReply(reply);
          return true;
        });
      }
    }
  }

  clearReplies() {
    this.replies.length = 0;
  }

  unsubscribeKeywordListener(channel: string) {
    this.keywordListeners.delete(channel);
  }

  private emitKeyword(name: string, keyword: Keyword) {
    this.keywordListeners.forEach(([wC, keys], channel) => {
      if (keys.includes(name)) {
        try {
          wC.send(channel, keyword);
        } catch {
          log.error(`Failed sending keyword to ${channel}`);
        }
      }
    });

    // Update keywords that we are tracking.
    if (this.trackedKeywords.has(name)) {
      this.trackedKeywords.set(name, keyword);
    }
  }

  processReply(reply: Reply) {
    reply.keywords.forEach((keyword) => {
      const name = `${reply.sender}.${keyword.name}`;
      this.emitKeyword(name, keyword);
    });
  }
}

const tron = new TronConnection();

export { tron as default };
