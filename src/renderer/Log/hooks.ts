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

export function useLogConfig() {
  const context = React.useContext(LogConfigContext);

  return context;
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
          (!replyCodeLetter || !config.codes.includes(replyCodeLetter))
        )
          return false;

        if (config.searchText && config.searchShowMatched) {
          if (!config.searchUseRegEx) {
            if (!reply.rawLine.includes(config.searchText)) return false;
          } else if (reply.rawLine.search(config.searchText) === -1) {
            return false;
          }
        }

        return true;
      }),
    [config]
  );

  return filterReplies;
}
