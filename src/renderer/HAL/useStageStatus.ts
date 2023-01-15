/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-14
 *  @Filename: useStageStatus.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { useKeywordContext } from 'renderer/hooks';

interface StageState {
  name: string;
  status: Map<string, string>;
}

function parseStageStatus(stageData: string[]) {
  const stageState: StageState = { name: stageData[0], status: new Map() };

  for (let ii = 1; ii < stageData.length; ii += 2) {
    stageState.status.set(stageData[ii], stageData[ii + 1]);
  }

  return stageState;
}

export default function useStageStatus(macroName: string) {
  const { 'hal.stage_status': stageStatusKw } = useKeywordContext();

  const initialState = { name: macroName, status: new Map() };
  const [state, setState] = React.useState<StageState>(initialState);

  React.useEffect(() => {
    if (!stageStatusKw || stageStatusKw.values[0] !== macroName) return;

    const { values } = stageStatusKw;
    const { status } = parseStageStatus(values);

    setState((current) => ({ ...current, status }));
  }, [stageStatusKw, macroName]);

  return state;
}
