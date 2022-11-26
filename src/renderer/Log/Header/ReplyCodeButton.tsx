/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: ReplyCodeButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import CodeIcon from '@mui/icons-material/Code';
import {
  bindHover,
  bindMenu,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import React from 'react';
import {
  CheckMenuItem,
  HeaderHoverMenu,
  HeaderIconButton,
} from 'renderer/Components';
import { useLogConfig } from '../hooks';

export default function ReplyCodeButton() {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'reply-code-menu',
  });

  const codes = ['Debug', 'Info', 'Warning', 'Error'];

  const { config, toggleCode } = useLogConfig();

  const handleClick = React.useCallback(
    (_: React.MouseEvent, item: string) => {
      toggleCode(item);
    },
    [toggleCode]
  );

  return (
    <>
      <HeaderIconButton
        sx={{ px: 0 }}
        {...bindHover(popupState)}
        Icon={CodeIcon}
      />
      <HeaderHoverMenu {...bindMenu(popupState)}>
        {codes.map((code) => (
          <CheckMenuItem
            key={code}
            text={code}
            onClick={handleClick}
            checked={config.codes.has(code.toLowerCase()[0])}
          />
        ))}
      </HeaderHoverMenu>
    </>
  );
}
