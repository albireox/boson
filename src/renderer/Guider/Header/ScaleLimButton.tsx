/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: ScaleLimButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AdjustIcon from '@mui/icons-material/Adjust';
import React from 'react';
import BosonIconMenu from 'renderer/Components/BosonIconMenu';
import BosonMenuItem, {
  BosonMenuItemRadio,
} from 'renderer/Components/BosonMenuItem';
import GuiderContext from '../Context';

export default function ScaleLimButton() {
  const guiderConfig = React.useContext(GuiderContext);

  const LIMITS = ['zscale', 'dataminmax'];

  return (
    <BosonIconMenu name='replyCodeButton' Icon={AdjustIcon}>
      {LIMITS.map((limit) => (
        <BosonMenuItem
          key={limit}
          text={limit}
          onSelect={(item) => guiderConfig.setParam('scalelim', item, true)}
          endAdornment={
            <BosonMenuItemRadio
              checked={guiderConfig.config.scalelim === limit}
            />
          }
        />
      ))}
    </BosonIconMenu>
  );
}
