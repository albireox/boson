/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: command.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { AsyncLock } from '../../utils/async';
import { CommandStatus, Reply, ReplyCode } from './types';

export default class Command {
  private static commandIdCounter = 0;
  private _lock = new AsyncLock();

  actor: string;
  command: string;
  commandId: number;
  status: CommandStatus = CommandStatus.Ready;

  replies: Reply[] = [];
  public readonly date = new Date();

  constructor(public rawCommand: string) {
    let chunks = rawCommand
      .trim()
      .match(/(.+?)\s(.+)/)!
      .slice(1, 3);

    [this.actor, this.command] = chunks;
    Command.commandIdCounter += 1;
    this.commandId = Command.commandIdCounter;

    this._lock.enable();
  }

  isDone() {
    if (
      this.status === CommandStatus.Done ||
      this.status === CommandStatus.Failed
    ) {
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
    console.log(reply);
    switch (reply.code) {
      case ReplyCode.Failed:
        this.status = CommandStatus.Failed;
        break;
      case ReplyCode.Error:
        this.status = CommandStatus.Failed;
        break;
      case ReplyCode.Done:
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
