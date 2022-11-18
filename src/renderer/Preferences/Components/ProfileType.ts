/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-18
 *  @Filename: ProfileType.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

type ProfileType = {
  observatory: string;
  program: string;
  user: string;
  host: string;
  port: number;
  needsAuthentication: boolean;
  httpHost: string;
  httpPort: number;
};

export default ProfileType;
