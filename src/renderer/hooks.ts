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
import { useCallback, useEffect, useRef, useState } from 'react';
import { getTAITime } from '../utils';

/**
 * Hook that returns a state with a mapping of keys to keywords. They keys are
 *    in the format {actor}.{key}. On mount, it registers a new listener with
 *    the tron model and updates. The listener is removed when the component
 *    is dismounted.
 * @param keys A list of keys to listen to in the format {actor}.{key}.
 * @param channel The channel on which to listen for the messages from the
 *    tron model.
 */
export function useKeywords(keys: string[], channel: string) {
  const [keywords, setKeywords] = useState<KeywordMap>({});

  // Store the parameters as a ref so that we can write a useEffect below
  // that runs only once and doesn't depend on mutable parameters.
  const params = useRef({ keys, channel });

  const getLowerKeys = () => {
    // Convert keys to lower-case, but keep the original. We'll revert when
    // the keywords get updated.
    return new Map(
      params.current.keys.map((value) => [value.toLowerCase(), value])
    );
  };

  const updateKeywords = useCallback((tronKeywords: KeywordMap) => {
    const keys = params.current.keys;
    const lowerKeys = getLowerKeys();
    const actors = keys
      .filter((k) => k.includes('.*'))
      .map((a) => a.split('.')[0]);
    const isAll = keys.includes('*');

    // Revert tronKeywords (all keys lowercase) to the original capitalisation.
    let newKeys: KeywordMap = {};
    for (let key in tronKeywords) {
      if (isAll || actors.includes(tronKeywords[key].actor)) {
        newKeys[key] = tronKeywords[key];
      } else {
        newKeys[lowerKeys.get(key) as string] = tronKeywords[key];
      }
    }
    setKeywords((prev) => {
      return { ...prev, ...newKeys };
    });
  }, []);

  useEffect(() => {
    const lowerKeys = getLowerKeys();
    const channel = params.current.channel;

    // Subscribe to model and listen on channel.
    window.api.on(channel, updateKeywords);
    window.api.invoke(
      'tron-register-model-listener',
      Array.from(lowerKeys.keys()),
      channel
    );

    const unload = () =>
      window.api.invoke('tron-remove-model-listener', channel);
    window.addEventListener('unload', unload);

    // Unsubscribe when component unmounts.
    return () => unload();
  }, [updateKeywords]);

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
  const params = useRef({ sendAll });

  const parseReplies = useCallback(
    (replies: string[]) => {
      // Deserialise the replies. Each item in the list is a stringified reply.
      onReceived(replies.map((r) => JSON.parse(r)));
    },
    [onReceived]
  );

  useEffect(() => {
    window.api.on('tron-model-received-reply', parseReplies);
  }, [parseReplies]);

  useEffect(() => {
    window.api.invoke('tron-add-streamer-window', params.current.sendAll);

    const unload = () => window.api.invoke('tron-remove-streamer-window');
    window.addEventListener('unload', unload);

    return () => unload();
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
