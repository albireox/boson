/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-23
 *  @Filename: hooks.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { Reply } from '../../main/tron';
import { ReplyCodeMap } from '../../main/tron/types';
import LogConfigContext from './config';

const ACTORS = new Set<string>([]);

export function useLogConfig() {
  const context = React.useContext(LogConfigContext);

  return context;
}

export function useActors(): [Set<string>, () => void] {
  return [ACTORS, () => ACTORS.clear()];
}

export function useReplyFilter() {
  const { config } = useLogConfig();

  const filterReplies = React.useCallback(
    (replies: Reply[]) =>
      replies.filter((reply) => {
        if (reply === undefined) return false;

        ACTORS.add(reply.sender);

        if (reply.sender === 'hub' && reply.rawLine.includes('Actors=')) {
          reply.keywords.forEach((key) => {
            if (key.name === 'Actors') {
              key.values.forEach((actor: string) =>
                ACTORS.add(actor.replace(/^"(.+(?="$))"$/, '$1'))
              );
            }
          });
        }

        const replyCodeLetter = ReplyCodeMap.get(reply.code);
        if (
          replyCodeLetter &&
          (!replyCodeLetter || !config.codes.has(replyCodeLetter))
        )
          return false;

        if (config.searchText && config.searchShowMatched) {
          if (!config.searchUseRegEx) {
            if (!reply.rawLine.includes(config.searchText)) return false;
          } else if (reply.rawLine.search(config.searchText) === -1) {
            return false;
          }
        }

        if (config.actors.size > 0 && !config.actors.has(reply.sender))
          return false;

        return true;
      }),
    [config]
  );

  return filterReplies;
}
