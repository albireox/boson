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
import { v4 as uuidv4 } from 'uuid';
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
export function useKeywords(keys: string[], channel: any = null, refresh: boolean = true) {
  const [keywords, setKeywords] = useState<KeywordMap>({});

  channel = (channel || uuidv4()) as string;

  // Store the parameters as a ref so that we can write a useEffect below
  // that runs only once and doesn't depend on mutable parameters.
  const params = useRef({ keys, channel });

  const getLowerKeys = () => {
    // Convert keys to lower-case, but keep the original. We'll revert when
    // the keywords get updated.
    return new Map(params.current.keys.map((value) => [value.toLowerCase(), value]));
  };

  const updateKeywords = useCallback((tronKeywords: KeywordMap) => {
    const keys = params.current.keys;
    const lowerKeys = getLowerKeys();
    const actors = keys.filter((k) => k.includes('.*')).map((a) => a.split('.')[0]);
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
    window.api.tron.subscribe(channel, updateKeywords);
    window.api.tron.registerModelListener(Array.from(lowerKeys.keys()), channel, refresh);

    const unload = () => window.api.tron.removeModelListener(channel);
    window.addEventListener('unload', unload);

    // Unsubscribe when component unmounts.
    return () => {
      unload();
    };
  }, [updateKeywords, refresh]);

  return keywords;
}

/**
 * Creates a subscription to the Tron stream for the current window.
 * @param onReceived The function to call when a new reply is received. The
 * function is called with a Reply object as the only argument.
 * @param sendAll Whether to send all the cumulated replies at the time of
 * the subscription.
 */
export function useListener(onReceived: (reply: Reply[]) => any, sendAll = true) {
  const params = useRef({ sendAll });

  const parseReplies = useCallback(
    (replies: string[]) => {
      // Deserialise the replies. Each item in the list is a stringified reply.
      onReceived(replies.map((r) => JSON.parse(r)));
    },
    [onReceived]
  );

  useEffect(() => {
    window.api.tron.onModelReceivedReply(parseReplies);
  }, [parseReplies]);

  useEffect(() => {
    window.api.tron.addStreamerWindow(params.current.sendAll);

    const unload = () => window.api.tron.removeStreamerWindow();
    window.addEventListener('unload', unload);

    return () => {
      unload();
    };
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

/*
 * Returns window size. Taken from https://usehooks.com/useWindowSize/
 */
export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/

  interface WindowSize {
    width: undefined | number;
    height: undefined | number;
  }

  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    // Add event listener
    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

/**
 * Hook that returns true if a command is running.
 * @param command The command string to match. If a command is running that
 *    matches the command, the state returned will be true.
 */
export function useCommandWatcher(command: string) {
  const cmdKeys = useKeywords(['cmds.CmdQueued', 'cmds.CmdDone']);

  const [running, setRunning] = useState(false);
  const [cmdID, setCmdID] = useState<number | null>(null);

  useEffect(() => {
    if (running) {
      if (!cmdKeys['cmds.CmdDone']) return;

      // If the command is running we only care about CmdDone.
      if (cmdKeys['cmds.CmdDone'].values[0] === cmdID) {
        setRunning(false);
      }
    } else {
      if (!cmdKeys['cmds.CmdQueued']) return;

      const values = cmdKeys['cmds.CmdQueued'].values;

      // Prevent infinite loop.
      if (values[0] === cmdID) return;

      let cmdStarted: string = `${values[4]} ${values[6]}`;
      if (cmdStarted.match(command)) {
        setCmdID(values[0]);
        setRunning(true);
      }
    }
  }, [cmdKeys, running, cmdID, command]);

  return running;
}
