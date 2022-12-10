/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-10
 *  @Filename: useKeywordValue.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import useKeywords from './useKeywords';

export default function useKeywordValue<T = unknown>(
  actor: string,
  keyword: string
) {
  const keywords = useKeywords(actor, [keyword]);

  const [values, setValues] = React.useState<T[] | undefined>(undefined);

  React.useEffect(() => {
    if (!keywords[keyword]) return;

    setValues(keywords[keyword].values);
  }, [keywords, keyword]);

  return values;
}
