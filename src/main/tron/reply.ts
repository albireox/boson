/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-06
 *  @Filename: reply.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Keyword, ReplyCode } from './types';

export default class Reply {
  public date: number;

  constructor(
    public rawLine: string,
    public commander: string,
    public sender: string,
    public commandId: number,
    public code: ReplyCode,
    public keywords: Keyword[]
  ) {
    this.date = Date.now();
  }

  public getKeyword(name: string) {
    // Returns the last keyword that matches name.

    // Use .slice() to reverse without modifying the order of the
    // original array.
    return this.keywords
      .slice()
      .reverse()
      .find((x) => x.name === name);
  }
}
