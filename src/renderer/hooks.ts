/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-03
 *  @Filename: hooks.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { KeywordMap, Reply } from 'main/tron';
import { useEffect, useState } from 'react';
import { getTAITime } from '../utils';

/**
 * Hook that returns a state with a mapping of keys to keywords. They keys are
 *    in the format {actor}.{key}. On mount, it registers a new listener with
 *    the tron model and updates. The listener is removed when the component
 *    is dismounted or when the window is closed.
 * @param keys A list of keys to listen to in the format {actor}.{key}.
 * @param channel The channel on which to listen for the messages from the
 *    tron model.
 */
export function useKeywords(
  keys: string[],
  channel = 'tron-model-updated'
): KeywordMap {
  const [keywords, setKeywords] = useState<KeywordMap>({});

  // Convert keys to lower-case, but keep the original. We'll revert when
  // the keywords get updated.
  const lowerKeys = new Map(keys.map((value) => [value.toLowerCase(), value]));
  const actors = keys
    .filter((k) => k.includes('.*'))
    .map((a) => a.split('.')[0]);
  const all = keys.includes('*');

  const updatekeywords = (tronKeywords: KeywordMap) => {
    // Revert tronKeywords (all keys lowercase) to the original capitalisation.
    let newKeys: KeywordMap = {};
    for (let key in tronKeywords) {
      if (all || actors.includes(tronKeywords[key].actor)) {
        newKeys[key] = tronKeywords[key];
      } else {
        newKeys[lowerKeys.get(key) as string] = tronKeywords[key];
      }
    }
    setKeywords({ ...keywords, ...newKeys });
  };

  // Event needs to go here because we need to bind the channel to updateKeywords
  // every time the component refreshes.
  window.api.on(channel, updatekeywords);

  useEffect(() => {
    // We do this inside a useEffect because we only want to register the
    // listener once.
    window.api.invoke(
      'tron-register-model-listener',
      Array.from(lowerKeys.keys()),
      channel
    );

    const removeListener = () => {
      window.api.invoke('tron-remove-model-listener', channel);
    };

    // Remove listener when the window closes. This may not be general enough
    // (for example, we may want to do this when the component is destroyed,
    // but not every time it renders). For now it's ok.
    window.addEventListener('beforeunload', removeListener);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return keywords;
}

/**
 * Creates a subscription to the Tron stream for the current window.
 * @param onReceived The function to call when a new reply is received. The
 * function is called with a Reply object as the only argument.
 * @param sendAll Whether to send all the cumulated replies at the time of
 * the subscription.
 */
export function useListener(
  onReceived: (reply: Reply[]) => any,
  sendAll = true
) {
  const parseReplies = (replies: string[]) => {
    // Deserialise the replies. Each item in the list is a stringified reply.
    onReceived(replies.map((r) => JSON.parse(r)));
  };
  window.api.on('tron-model-received-reply', parseReplies);

  const removeListener = () => {
    window.api.invoke('tron-remove-streamer-window');
  };

  useEffect(() => {
    window.api.invoke('tron-add-streamer-window', sendAll);
    window.addEventListener('beforeunload', removeListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Returns a state clock with the current TAI date.
 */
export function useTAI(): Date {
  const [date, setDate] = useState<Date>(getTAITime());

  useEffect(() => {
    let interval = setInterval(() => setDate(getTAITime()), 1000);
    return () => clearInterval(interval);
  }, [date]);

  return date;
}
