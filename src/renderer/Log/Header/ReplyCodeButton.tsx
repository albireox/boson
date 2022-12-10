/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: ReplyCodeButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import CodeIcon from '@mui/icons-material/Code';
import React from 'react';
import BosonIconMenu from 'renderer/Components/BosonIconMenu';
import BosonMenuItem, {
  BosonMenuItemCheckbox,
} from 'renderer/Components/BosonMenuItem';
import { useLogConfig } from '../hooks';

export default function ReplyCodeButton() {
  const codes = ['Debug', 'Info', 'Warning', 'Error'];

  const { config, toggleCode } = useLogConfig();

  const handleClick = React.useCallback(
    (item: unknown) => {
      toggleCode(item as string);
    },
    [toggleCode]
  );

  return (
    <BosonIconMenu
      name='replyCodeButton'
      Icon={CodeIcon}
      IconButtonProps={{ sx: { px: 0 } }}
    >
      {codes.map((code) => {
        const selected = config.codes.has(code.toLowerCase()[0]);
        return (
          <BosonMenuItem
            key={code}
            text={code}
            onSelect={handleClick}
            endAdornment={<BosonMenuItemCheckbox checked={selected} />}
          />
        );
      })}
    </BosonIconMenu>
  );
}
