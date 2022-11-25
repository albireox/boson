/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: ReplyCodeButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import FlagIcon from '@mui/icons-material/Flag';
import {
  bindHover,
  bindMenu,
  usePopupState,
} from 'material-ui-popup-state/hooks';
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

  const handleClick = (_, item: string) => {
    const itemL = item.toLowerCase();
    toggleCode(itemL);
  };

  return (
    <>
      <HeaderIconButton {...bindHover(popupState)} Icon={FlagIcon} />
      <HeaderHoverMenu {...bindMenu(popupState)}>
        {codes.map((code) => (
          <CheckMenuItem
            key={code}
            text={code}
            onClick={handleClick}
            checked={config.codes.includes(code.toLowerCase()[0])}
          />
        ))}
      </HeaderHoverMenu>
    </>
  );
}
