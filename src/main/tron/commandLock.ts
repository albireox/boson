/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-06
 *  @Filename: asyncLock.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export default class CommandLock<Type> {
  // See https://medium.com/@chris_marois/asynchronous-locks-in-modern-javascript-8142c877baf

  disable = () => {};

  promise: Promise<Type> | null = null;

  constructor(public resolveObject: Type) {}

  enable() {
    this.promise = new Promise((resolve) => {
      this.disable = () => resolve(this.resolveObject);
    });
  }
}
