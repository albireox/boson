/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-03
 *  @Filename: hooks.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useEffect, useState } from 'react';
import { KeywordMap } from '../electron/tron';

/**
 * Hook that returns a state with a mapping of keys to keywords. They keys are
 *    in the format {actor}.{key}. On mount, it registers a new listener with
 *    the tron model and updates. The listener is removed when the component
 *    is dismounted or when the window is closed.
 * @param keys A list of keys to listen to in the format {actor}.{key}.
 * @param channel The channel on which to listen for the messages from the
 *    tron model.
 */
export function useKeywords(keys: string[], channel = 'tron-model-updated'): KeywordMap {
  const [keywords, setKeywords] = useState<KeywordMap>({});

  const updatekeywords = (tronKeywords: KeywordMap) => {
    setKeywords({ ...keywords, ...tronKeywords });
  };

  const removeListener = () => {
    window.api.invoke('tron-remove-model-listener', keys);
  };

  // Event needs to go here because we need to bind the channel to updateKeywords
  // every time the component refreshes.
  window.api.on(channel, updatekeywords);

  // Remove listener when the window closes. This may not be general enough
  // (for example, we may want to do this when the component is destroyed,
  // but not every time it renders). For now it's ok.
  window.addEventListener('beforeunload', removeListener);

  useEffect(() => {
    // We do this inside a useEffect because we only want to register the
    // listener once.
    window.api.invoke('tron-register-model-listener', keys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return keywords;
}
