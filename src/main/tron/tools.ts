/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-06
 *  @Filename: tools.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import tron from './tron';
import { ConnectionStatus } from './types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function connectAndAuthorise(
  authorise = true,
  timeout = 5
) {
  if (!(tron.status & ConnectionStatus.Connected)) {
    if (!(tron.status & ConnectionStatus.Connecting)) {
      tron.connect();
    }

    let elapsed = 0;
    while (elapsed < timeout * 1000) {
      if (tron.status & ConnectionStatus.Connected) break;
      if (!(tron.status & ConnectionStatus.Connecting)) {
        return tron.status;
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(500);
      elapsed += 500;
    }

    if (elapsed >= timeout * 1000) {
      return tron.status;
    }
  }

  if (!authorise) return tron.status;

  if (!(tron.status & ConnectionStatus.Authorised)) {
    if (!(tron.status & ConnectionStatus.Authorising)) {
      await tron.authorise();
    }
  }

  return tron.status;
}
