/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-10
 *  @Filename: useIsMacroRunning.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useKeywordContext } from 'renderer/hooks';

export default function useIsMacroRunning(macroName: string) {
  const { 'hal.running_macros': runningMacros } = useKeywordContext();

  return (
    runningMacros !== undefined && runningMacros.values.includes(macroName)
  );
}
