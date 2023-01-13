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

  private static commandIdCounterInternal = 65000;

  commandId: number;

  lock: CommandLock<this> | undefined;

  actor: string;

  command: string;

  status: CommandStatus = CommandStatus.Ready;

  public readonly date = new Date();

  public readonly replies: Reply[] = [];

  constructor(public rawCommand: string, public internal = false) {
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

    if (!internal) {
      Command.commandIdCounter += 1;
      if (Command.commandIdCounter >= 60000) Command.commandIdCounter = 0;
      this.commandId = Command.commandIdCounter;
    } else {
      // Use a specific range for private commands.
      Command.commandIdCounterInternal += 1;
      if (Command.commandIdCounterInternal >= 65535)
        Command.commandIdCounterInternal = 60000;
      this.commandId = Command.commandIdCounterInternal;
    }

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
    await this.lock?.promise;
    return this;
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
      this.lock?.disable();
    }
  }
}
