/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-10
 *  @Filename: useIsMacroRunning.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useKeywordValue } from 'renderer/hooks';

export default function useIsMacroRunning(macroName: string) {
  const runningMacros = useKeywordValue<string>('hal', 'running_macros');

  return runningMacros && runningMacros.includes(macroName);
}
