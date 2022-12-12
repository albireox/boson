/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-11
 *  @Filename: keywordContext.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Keyword } from 'main/tron/types';
import React from 'react';

export type KeywordContextType = {
  [keyword: string]: Keyword;
};

export const KeywordContext = React.createContext<KeywordContextType>({});

export function useKeywordContext() {
  return React.useContext(KeywordContext);
}
