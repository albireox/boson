/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: IconButtonFlat.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { IconButton, IconButtonProps } from '@mui/material';

export default function IconButtonFlat(props: IconButtonProps) {
  return (
    <IconButton
      sx={{ p: 0 }}
      disableFocusRipple
      disableTouchRipple
      disableRipple
      {...props}
    />
  );
}
