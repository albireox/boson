/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: ColormapButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import ColorLensIcon from '@mui/icons-material/ColorLens';
import React from 'react';
import BosonIconMenu from 'renderer/Components/BosonIconMenu';
import BosonMenuItem, {
  BosonMenuItemRadio,
} from 'renderer/Components/BosonMenuItem';
import GuiderContext from '../Context';

export default function ColormapButton() {
  const guiderConfig = React.useContext(GuiderContext);

  const COLORS = [
    'grey',
    'heat',
    'cool',
    'viridis',
    'magma',
    'red',
    'green',
    'blue',
  ];

  return (
    <BosonIconMenu name='replyCodeButton' Icon={ColorLensIcon}>
      {COLORS.map((color) => (
        <BosonMenuItem
          key={color}
          text={color}
          onSelect={(item) => guiderConfig.setParam('colormap', item, true)}
          endAdornment={
            <BosonMenuItemRadio
              checked={guiderConfig.config.colormap === color}
            />
          }
        />
      ))}
    </BosonIconMenu>
  );
}
