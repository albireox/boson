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
import store from '../store';
import { generateName } from '../util';
import Command from './command';
import parseLine from './keywords';
import Reply from './reply';
import { ConnectionStatus, ReplyCode, ReplyCodeReverseMap } from './types';

export class TronConnection {
  private connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;

  private host: string | undefined = undefined;

  private port: number | undefined = undefined;

  private commands: Map<number, Command> = new Map();

  private listeners: Map<number, WebContents> = new Map();

  client = new Socket();

  lastConnected: Date | undefined = undefined;

  constructor() {
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

    this.host = newHost;
    this.port = newPort;

    this.status |= ConnectionStatus.Connecting;
    this.client.connect({ host: newHost, port: newPort });

    return this.status;
  }

  async authorise(): Promise<[boolean, string | null]> {
    const program: string = store.get('connection.program');
    let user: string = store.get('connection.user');
    const password = await keytar.getPassword('boson', program);

    if (user === undefined || user.trim() === '') {
      user = generateName();
    }

    if (!password) {
      this.connectionStatus |=
        ConnectionStatus.NoPassword | ConnectionStatus.AuthenticationFailed;
      this.disconnect();
      return [false, null];
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
    this.status = ConnectionStatus.Connected | ConnectionStatus.Authorised;

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
    command.lock.promise?.then((value) => {
      this.commands.delete(value.commandId);
      return null;
    });

    // Write to socket.
    this.client.write(`${command.commandId} ${command.rawCommand}\r\n`);

    return command;
  }

  parseData(data: string) {
    const newLines = data.trim().split(/\r|\n/);

    newLines.forEach((line) => {
      const [lineMatched, keywords] = parseLine(line);

      if (!lineMatched || !lineMatched.groups) return;

      const { groups } = lineMatched;

      const reply = new Reply(
        line,
        groups.commander,
        groups.sender,
        parseInt(groups.commandId, 10),
        ReplyCodeReverseMap.get(groups.code.toLowerCase()) || ReplyCode.Unknown,
        keywords
      );

      this.commands.get(reply.commandId)?.addReply(reply);
      this.listeners.forEach((win) => win.send('tron:received-reply', reply));
    });
  }

  subscribeWindow(sender: WebContents) {
    const { id } = sender;
    if (sender.isDestroyed()) {
      this.unsubscribeWindow(sender);
      return;
    }
    if (this.listeners.has(id)) {
      log.warn(`Window ${id} is already subscribed.`);
      return;
    }
    this.listeners.set(id, sender);
    log.info(
      `Window ${id} has been subscribed. ` +
        `${this.listeners.size} listeners connected.`
    );
  }

  unsubscribeWindow(sender: WebContents) {
    const { id } = sender;
    if (!this.listeners.has(id)) {
      log.warn(`Window ${id} is not subscribed.`);
      return;
    }
    this.listeners.delete(id);
    log.info(
      `Window ${id} has been unsubscribed. ` +
        `${this.listeners.size} listeners still connected.`
    );
  }
}

const tron = new TronConnection();

export { tron as default };
