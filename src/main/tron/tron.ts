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
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { config, store } from '../store';
import { playSound } from '../utils';
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

  private loggers: Map<number, WebContents> = new Map([]);

  private buffer: Reply[] = [];

  private keywordListeners: Map<WebContents, Set<string>> = new Map();

  private replies: Reply[] = [];

  private actors = new Set<string>([]);

  private client = new Socket();

  private maxLogMessages: number;

  public trackedKeywords: Map<string, Keyword | null> = new Map();

  public trackedKeywordsAll: Map<string, Keyword[]> = new Map();

  host: string | undefined = undefined;

  port: number | undefined = undefined;

  user: string | undefined = undefined;

  program: string | undefined = undefined;

  lastConnected: Date | undefined = undefined;

  taiOffset: number = 0.0;

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

    setInterval(() => this.emitToLoggers(), 1000);
  }

  private initialiseKeywords() {
    const { keywords } = config;
    const { trackAll, trackLast } = keywords;

    trackLast.forEach((keyword) => this.trackedKeywords.set(keyword, null));
    trackAll.forEach((keyword) => this.trackedKeywordsAll.set(keyword, []));
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
      user = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '',
        style: 'capital',
      });
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
      const reason = (kkCommand.replies[0].getKeyword('why')?.values[0] ??
        'unknown') as string;
      log.error(`Failed getting nonce: ${reason}.`);
      this.connectionStatus |= ConnectionStatus.AuthenticationFailed;
      this.disconnect();
      return [false, reason];
    }

    const nonceKw = kkCommand.replies[0].getKeyword('nonce');
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
      const reason = (loginCommand.replies[0].getKeyword('why')?.values[0] ??
        'unknown') as string;
      log.error(`Failed to log in: ${reason}.`);
      this.connectionStatus |= ConnectionStatus.AuthenticationFailed;
      this.disconnect();
      return [false, reason];
    }

    loginCommand.replies.every((reply) => {
      if (reply.getKeyword('cmdrID')) {
        user = reply.getKeyword('cmdrID')?.values[0].split('.').slice(-1)[0];
        return false;
      }
      return true;
    });

    log.info('Getting list of users.');
    this.sendCommand('hub commanders', true);

    log.info('Logging in complete.');
    this.user = user;
    this.program = program;
    this.status =
      ConnectionStatus.Connected |
      ConnectionStatus.Authorised |
      ConnectionStatus.Ready;

    // Trigger an update of the TAI offset.
    const observatory = store.get('connection.observatory') ?? 'APO';
    if (observatory === 'APO') {
      this.sendCommand('tcc show time', true);
    } else {
      this.sendCommand('lcotcc show time', true);
    }

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

  sendCommand(commandString: string, internal = false) {
    const command = new Command(commandString, internal);
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

  updateTAIOffset(tai: number) {
    // Updates the internal offset between system time and TCC UTC.

    // The MJD on Jan 1st 1970. The TCC returns the TAI in seconds since
    // the beginning of MJD time.
    const TAI_MJD = 40587;

    const now = new Date();
    this.taiOffset = tai - TAI_MJD * 3600 * 24 - now.getTime() / 1000;
  }

  parseData(data: string) {
    const CmdQueuedRegex =
      /CmdQueued=([0-9]+),([0-9.]+),"(.+?)",([0-9]+),"(.+?)",([0-9]+),"(.+?)"/;

    const newLines = data.trim().split(/\r|\n/);

    newLines.forEach((line) => {
      const [lineMatched, keywords] = parseLine(line);

      if (!lineMatched || !lineMatched.groups) return;

      const { groups } = lineMatched;
      let rawLine = line;

      const commandId = parseInt(groups.commandId, 10);
      const thisCommand = this.commands.get(commandId);
      let isInternal = thisCommand?.internal ?? false;

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
            if (cmdId >= 60000) isInternal = true;
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
              if (cmdId && cmdId >= 60000) isInternal = true;
            }
          }
        }
      }

      const reply = new Reply(
        rawLine,
        groups.commander,
        groups.sender,
        commandId,
        ReplyCodeReverseMap.get(groups.code.toLowerCase()) ?? ReplyCode.Unknown,
        keywords
      );

      // Parse messages and play sounds.
      if (/\S+\s\d+\s\S+\s[f!]/.test(reply.rawLine)) {
        playSound('error');
      } else if (/alert=\S+/.test(reply.rawLine)) {
        playSound('error_serious');
      } else if (
        reply.sender === 'tcc' &&
        /\S+\s\d+\s\S+\s\S\strack/.test(reply.rawLine)
      ) {
        playSound('axis_slew');
      } else if (
        reply.sender === 'lcotcc' &&
        /\S+\s\d+\s\S+\s\S\starget/.test(reply.rawLine)
      ) {
        playSound('axis_slew');
      } else if (
        (reply.sender === 'apogee' &&
          /\S+\s\d+\s\S+\s\S\sexposureState=exposing/.test(reply.rawLine)) ||
        (reply.sender === 'boss' &&
          /\S+\s\d+\s\S+\s\S\sexposureState=FLUSHING/.test(reply.rawLine)) ||
        (reply.sender === 'yao' &&
          /\S+\s\d+\s\S+\s\S\ssp2_status_names=EXPOSING/.test(reply.rawLine))
      ) {
        playSound('exposure_start');
      } else if (
        reply.sender === 'tcc' &&
        /\S+\s\d+\s\S+\s\S\sSlewEnd/.test(reply.rawLine)
      ) {
        playSound('axis_halt');
      } else if (
        (reply.sender === 'apogee' &&
          /\S+\s\d+\s\S+\s\S\sexposureState=done/.test(reply.rawLine)) ||
        (reply.sender === 'boss' &&
          /\S+\s\d+\s\S+\s\S\stext="Readout complete/.test(reply.rawLine)) ||
        (reply.sender === 'yao' &&
          /\S+\s\d+\s\S+\s\S\sfilenames=/.test(reply.rawLine))
      ) {
        playSound('exposure_end');
      }

      // Update reply date to match TCC TAI.
      reply.date += this.taiOffset * 1000;

      reply.internal = isInternal;

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

      thisCommand?.addReply(reply);
      this.buffer.push(reply);

      if (
        (reply.sender === 'tcc' || reply.sender === 'lcotcc') &&
        reply.getKeyword('TAI')
      ) {
        this.updateTAIOffset(reply.getKeyword('TAI')?.values[0]);
      }

      this.processReply(reply);
    });
  }

  getReplies(last?: number) {
    if (!last) {
      return this.replies;
    }
    return this.replies.slice(-last);
  }

  getActors() {
    return this.actors;
  }

  emitToLoggers() {
    if (this.buffer.length === 0) return;

    this.loggers.forEach(
      (win) => win && win.send('tron:received-replies', this.buffer)
    );

    this.buffer.length = 0;
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
    keywords: string[],
    getKeys = true
  ) {
    const current = this.keywordListeners.get(sender) ?? new Set([]);
    keywords.forEach((key) => current.add(key));

    this.keywordListeners.set(sender, current);

    const untracked: string[] = [];
    const observatory: string = store.get('connection.observatory') ?? 'APO';

    keywords.forEach((key, idx) => {
      const trackedKeyword = this.trackedKeywords.get(key);
      if (!trackedKeyword) {
        this.trackedKeywords.set(key, null);
        untracked.push(keywords[idx]);
      } else if (getKeys) {
        this.emitKeyword(key, trackedKeyword);
      }
    });

    if (getKeys && untracked.length > 0) {
      const actors = new Set(untracked.map((kw) => kw.split('.')[0]));

      actors.forEach((actor) => {
        const actorKeys = untracked
          .filter((kw) => kw.startsWith(actor))
          .map((kw) => kw.split('.')[1]);

        // HACK: quick fix to avoid error sound when connecting to an
        // observatory without the specific actor.
        if (actor === 'yao' && observatory === 'APO') {
          return true;
        } else if (actor === 'boss' && observatory === 'LCO') {
          return true;
        }

        this.sendCommand(`keys getFor=${actor} ${actorKeys.join(' ')}`, true)
          .awaitUntilDone()
          .then(({ replies }) => {
            if (replies.length > 0) {
              replies.every((reply) => {
                if (reply.code !== ReplyCode.Info) return true;
                this.processReply(reply);
                return true;
              });
            }
            return true;
          })
          .catch(() => {});
      });
    }
  }

  clearReplies() {
    this.replies.length = 0;
  }

  unsubscribeKeywordListener(sender: WebContents) {
    this.keywordListeners.delete(sender);
  }

  private emitKeyword(name: string, keyword: Keyword) {
    let pName = name;
    if (name.startsWith('keys_')) {
      pName = name.slice(5);
    }

    this.keywordListeners.forEach((keys, wC) => {
      if (keys.has(pName)) {
        if (wC.isDestroyed()) {
          this.unsubscribeKeywordListener(wC);
          log.debug(`Removing keyword event for window ${wC.id}.`);
          return;
        }

        try {
          wC.send('tron-keywords', pName, keyword);
        } catch {
          log.error(`Failed sending keyword ${pName} to tron-keywords.`);
        }
      }
    });

    // Update keywords that we are tracking.
    if (this.trackedKeywords.has(pName)) {
      this.trackedKeywords.set(pName, keyword);
    }

    if (this.trackedKeywordsAll.has(pName) && !name.startsWith('keys_')) {
      const current = this.trackedKeywordsAll.get(pName) ?? [];
      current.push(keyword);
      this.trackedKeywordsAll.set(pName, current);
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

export { tron };
