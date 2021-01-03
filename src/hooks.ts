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

  useEffect(() => {
    const updatekeywords = (tronKeywords: KeywordMap) => {
      setKeywords({ ...keywords, ...tronKeywords });
    };

    const removeListener = () => {
      window.api.invoke('tron-remove-model-listener', keys);
    };

    window.api.on(channel, updatekeywords);
    window.api.invoke('tron-register-model-listener', keys);

    // Remove listener when the window closes.
    window.addEventListener('beforeunload', removeListener);

    // This probably never gets executed, but just in case, add a cleanup
    // function for the component.
    return () => removeListener();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return keywords;
}
