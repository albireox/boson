/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-23
 *  @Filename: hooks.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Reply from 'main/tron/reply';
import { ReplyCodeMap } from 'main/tron/types';
import React from 'react';
import LogConfigContext from './config';

export function useLogConfig() {
  const context = React.useContext(LogConfigContext);

  return context;
}

export function useActors(): string[] {
  const [actors, setActors] = React.useState<string[]>([]);

  const updateActors = React.useCallback(() => {
    window.electron.tron
      .getActors()
      .then((newActors) => setActors(Array.from(newActors)))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    updateActors();
    const interval = setInterval(updateActors, 30);

    return () => clearInterval(interval);
  }, [updateActors]);

  return actors;
}

export function useReplyFilter() {
  const { config } = useLogConfig();

  const filterReplies = React.useCallback(
    (replies: Reply[]) =>
      replies.filter((reply) => {
        if (reply === undefined) return false;

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

        if (config.actors.size > 0) {
          if (reply.sender !== 'cmds' && !config.actors.has(reply.sender)) {
            return false;
          }
          if (reply.sender === 'cmds') {
            // TODO: this is not perfect and could cause some false positives.
            let success = false;
            Array.from(config.actors).some((actor) => {
              if (reply.rawLine.includes(actor)) {
                success = true;
                return true;
              }
              return false;
            });
            if (!success) return false;
          }
        }

        return true;
      }),
    [config]
  );

  return filterReplies;
}
