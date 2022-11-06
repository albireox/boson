/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-03
 *  @Filename: tron.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { webContents } from 'electron';
import log from 'electron-log';
import { Socket } from 'net';
import store from './store';
import { ConnectionStatus } from './types';

export class TronConnection {
  private static instance: TronConnection;

  private connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;

  private keepReconnecting: boolean = true;

  private host: string | undefined = undefined;

  private port: number | undefined = undefined;

  private reconnectTimeout: ReturnType<typeof setTimeout> | undefined =
    undefined;

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
      this.attemptToReconnect(
        ConnectionStatus.Disconnected | ConnectionStatus.Failed
      );
    });
    this.client.on('end', () => {
      log.info(`Connection to ${this.host}:${this.port} ended.`);
      this.attemptToReconnect(ConnectionStatus.Disconnected);
    });
    this.client.on('data', (buffer: Buffer) =>
      TronConnection.parseData(buffer.toString())
    );
  }

  public static getInstance(): TronConnection {
    if (!TronConnection.instance) {
      TronConnection.instance = new TronConnection();
    }

    return TronConnection.instance;
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

  connect(host?: string, port?: number, reconnect = false): ConnectionStatus {
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

    if (!reconnect) this.keepReconnecting = true;

    return this.status;
  }

  disconnect() {
    log.info("Disconnecting at user's request");
    this.keepReconnecting = false;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.client.destroy();
    this.status = ConnectionStatus.Disconnected;
  }

  private attemptToReconnect(currentStatus: ConnectionStatus = 0) {
    if (!this.keepReconnecting) {
      // Update status to issue event
      this.status = currentStatus;
      return;
    }

    if (this.host === undefined || this.port === undefined) {
      log.error('Host or port not defined. Cannot reconnect.');
      this.keepReconnecting = false;
      return;
    }

    log.info(`Trying to reconnect to ${this.host}:${this.port}`);
    this.status = currentStatus | ConnectionStatus.Reconnecting;
    this.reconnectTimeout = setTimeout(
      () =>
        this.host && this.port
          ? this.connect(this.host, this.port, true)
          : null,
      3000
    );
  }

  static parseData(data: string) {
    log.info(data);
  }
}

const tron = new TronConnection();

export { tron as default };
