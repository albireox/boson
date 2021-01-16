/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: model.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import log from 'electron-log';
import { IpcMainInvokeEvent } from 'electron/main';
import { chunk as _chunk } from 'lodash';
import TronConnection from './connection';
import { Keyword, KeywordMap } from './types';

/**
 * A class that represents the tron keyword model and emits events when a
 * keyword is updated.
 */
export default class TronModel {
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
      // If the window has been closed
      if (event.sender.isDestroyed()) {
        this.removeListener(channel);
        return;
      }
      event.sender.send(channel, data);
    } catch (err) {
      let id = event.sender.isDestroyed() ? 'destroyed' : event.sender.id;
      log.error(`Failed sending message to (${id}, ${channel}): ${err}`);
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
      key = key.toLowerCase();
      // Checks that the key is *, actor.*, or actor.key.
      if (!key.match(/^\*|[a-z]+\.[a-z*]+$/i)) {
        log.error(`Cannot register a listener for key ${key}`);
        continue;
      }
      if (!(key in this._listeners)) {
        this._listeners[key] = [[event, channel]];
        log.debug(
          `Registering listener for ${key} on (${event.sender.id}, ${channel})`
        );
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
          log.debug(
            `Registering listener for ${key} on (${event.sender.id}, ${channel})`
          );
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
   * Removes a listener.
   * @param channel A string with the name of the channel on which the
   *    renderer window was listening to. All associated keys will be removed.
   */
  removeListener(channel: string) {
    for (let key in this._listeners) {
      key = key.toLowerCase();
      for (let nn of this._listeners[key].keys()) {
        if (this._listeners[key][nn][1] === channel) {
          let event = this._listeners[key][nn][0];
          let id = event.sender.isDestroyed() ? 'destroyed' : event.sender.id;
          log.debug(`Removing listener (${id}, ${channel}).`);
          this._listeners[key].splice(nn);
        }
      }
    }
  }

  /**
   * Updates the keyword mapping.
   * @param kw The new keyword.
   */
  updateKeyword(kw: Keyword) {
    let fullKey = `${kw.actor.toLowerCase()}.${kw.key.toLowerCase()}`;
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
    actor = actor.toLowerCase();
    key = key.toLowerCase();
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
   * @param keys Keys to refresh. If not provided, refreshes all the keywords
   *    that are currently being listened to.
   * @param maxChunk Maximum number of keys to ask for to tron at once.
   */
  refreshKeywords(keys?: string[], maxChunk = 10) {
    keys = keys || Object.keys(this._listeners);
    // Remove keys that contain a wildcard. We cannot refresh them because
    // we don't have a full datamodel of the actor keys.
    keys = keys.filter((key) => !key.includes('*'));
    let actors = new Set(keys.map((k) => k.split('.')[0]));
    for (let actor of actors) {
      let actorKeys = keys.filter((k) => k.includes(`${actor}.`));
      if (actorKeys.length > maxChunk) {
        for (let ak of _chunk(actorKeys, maxChunk))
          this.refreshKeywords(ak, maxChunk);
      } else {
        let keyNames = actorKeys.map((ak) => ak.split('.')[1]);
        let cmd = `keys getFor=${actor} ${keyNames.join(' ')}`;
        this.tron.sendCommand(cmd);
      }
    }
  }
}
