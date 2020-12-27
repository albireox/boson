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
  (param?: any): void
}


export enum ConnectionStatusEnum {
  Disconnected,
  Connecting,
  Connected,
  Authorising,
  Authorised,
  Failed,
  TimedOut
}


export class TronModel {

  stream: string[] = [];
  model: { [key: string]: any } = {};

  streamers: number[] = [];
  listeners: { [key: string]: { (keymodel: any): void } } = {};

  addStreamerWindow(windowId: number): void {
    if (!this.streamers.includes(windowId)) this.streamers.push(windowId);
  }

  parseData(data: string) {
    const newLines = data.split(/\r?\n/);
    this.stream.push(...newLines)
    for (let line of newLines) {
      line = line.trim();
      if (!line) continue;
      this.streamers.forEach(id => {
        const webContents: any = BrowserWindow.fromId(id)?.webContents;
        webContents.send('tron-model-received-line', line);
      })
    }
  }
}


export class TronConnection {

  private static _instance: TronConnection;
  private _connectionStatus: ConnectionStatusEnum = ConnectionStatusEnum.Disconnected;

  client = new Socket();
  model = new TronModel();
  stateCallbacks: { [cbType: string]: Callback[] } = {};

  constructor() {
    this.registerCallback('connect', () => {
      this.connectionStatus = ConnectionStatusEnum.Connected;
      console.log('Connected to tron.');
    })
    this.registerCallback('error', (err) => {
      this.connectionStatus = ConnectionStatusEnum.Failed;
      console.log(`TronConnection failed: ${err}.`);
    })
    this.registerCallback('end', (err) => {
      this.connectionStatus = ConnectionStatusEnum.Disconnected;
      console.log('Disconnected from tron.');
    })
    this.registerCallback('data', (buffer: Buffer) => {
      this.model.parseData(buffer.toString());
    })
  }

  public static getInstance(): TronConnection {
    if (!TronConnection._instance) {
      TronConnection._instance = new TronConnection();
    }

    return TronConnection._instance;
  }

  get connectionStatus(): ConnectionStatusEnum {
    return this._connectionStatus;
  }

  set connectionStatus(value: ConnectionStatusEnum) {
    this._connectionStatus = value;
  }

  registerCallback(cbType: string, cb: Callback) {

    if (cbType in this.stateCallbacks) {
      this.stateCallbacks[cbType].push(cb)
    } else {
      this.stateCallbacks[cbType] = [cb]
    }

    this.client.on(cbType,
      (...params) => this.stateCallbacks[cbType].forEach(cb => cb(...params)));

  }

  async connect(host: string, port: number): Promise<ConnectionStatusEnum> {

    if ([ConnectionStatusEnum.Connected, ConnectionStatusEnum.Authorising,
    ConnectionStatusEnum.Authorised].includes(this.connectionStatus)) {
      return this.connectionStatus;
    }

    this.connectionStatus = ConnectionStatusEnum.Connecting;
    this.client.connect({ host: host, port: port })

    let elapsedTime = 0.0;
    while (elapsedTime < 5.) {
      if (this.connectionStatus !== ConnectionStatusEnum.Connecting) return this.connectionStatus;
      await new Promise(r => setTimeout(r, 50));
    }
    this.connectionStatus = ConnectionStatusEnum.TimedOut;
    return this.connectionStatus

  }

  // authorise(username: string, password: string, program: string) {}

  disconnect() {
    this.client.destroy();
  }

}
