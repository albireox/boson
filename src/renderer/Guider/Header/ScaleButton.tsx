/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: ScaleButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import ContrastIcon from '@mui/icons-material/Contrast';
import React from 'react';
import BosonIconMenu from 'renderer/Components/BosonIconMenu';
import BosonMenuItem, {
  BosonMenuItemRadio,
} from 'renderer/Components/BosonMenuItem';
import GuiderContext from '../Context';

export default function ScaleButton() {
  const guiderConfig = React.useContext(GuiderContext);

  const SCALES = [
    'linear',
    'log',
    'histeq',
    'power',
    'sqrt',
    'squared',
    'asinh',
    'sinh',
  ];

  return (
    <BosonIconMenu name='replyCodeButton' Icon={ContrastIcon}>
      {SCALES.map((scale) => (
        <BosonMenuItem
          key={scale}
          text={scale}
          onSelect={(item) => guiderConfig.setParam('scale', item, true)}
          endAdornment={
            <BosonMenuItemRadio checked={guiderConfig.config.scale === scale} />
          }
        />
      ))}
    </BosonIconMenu>
  );
}
