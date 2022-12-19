/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-18
 *  @Filename: stringToColour.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export default function stringToColour(myString: string) {
  let hash = 0;
  for (let i = 0; i < myString.length; i += 1) {
    hash = myString.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += `00${value.toString(16)}`.slice(-2);
  }
  return colour;
}
