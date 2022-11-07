/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: command.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import CommandLock from './commandLock';
import Reply from './reply';
import { CommandStatus, ReplyCode } from './types';

export default class Command {
  private static commandIdCounter = 0;

  commandId: number;

  lock: CommandLock<Command>;

  actor: string;

  command: string;

  status: CommandStatus = CommandStatus.Ready;

  public readonly date = new Date();

  public readonly replies: Reply[] = [];

  constructor(public rawCommand: string) {
    this.lock = new CommandLock(this);

    const chunks: string[] =
      rawCommand
        .trim()
        .match(/(.+?)\s(.+)/)
        ?.slice(1, 3) ?? [];

    if (chunks.length < 2) {
      throw new Error('Invalid command.');
    }

    [this.actor, this.command] = chunks;

    Command.commandIdCounter += 1;
    this.commandId = Command.commandIdCounter;

    this.lock.enable();
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

  async awaitUntilDone() {
    await this.lock.promise;
  }

  addReply(reply: Reply) {
    this.replies.push(reply);

    switch (reply.code) {
      case ReplyCode.Failed:
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
      this.lock.disable();
    }
  }
}
