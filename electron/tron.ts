/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: tron.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import { Socket } from 'net';


interface Callback {
  (param?: any): void
}

enum ConnectionStatus {
  Disconnected,
  Connecting,
  Connected,
  Authorising,
  Authorised,
  Failed
}

class TronConnection {

  connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;
  client = new Socket();
  stateCallbacks: {[cbType: string]: Callback[]} = {};

  constructor() {
    this.registerCallback('connect', () => {
      this.connectionStatus = ConnectionStatus.Connected;
      console.log('Connected to tron.');
    })
    this.registerCallback('error', (err) => {
      this.connectionStatus = ConnectionStatus.Failed;
      console.log(`TronConnection failed: ${err}.`);
    })
    this.registerCallback('end', (err) => {
      this.connectionStatus = ConnectionStatus.Disconnected;
      console.log('Disconnected from tron.');
    })
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

  connect(host: string, port: number) {
    if (![ConnectionStatus.Connected,
          ConnectionStatus.Authorised].includes(this.connectionStatus)) {
      this.client.connect({host: host, port: port})
    }
  }

  disconnect() {
    this.client.destroy();
  }

}

export default new TronConnection();
