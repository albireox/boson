/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: BosonIconMenu.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import {
  bindHover,
  bindMenu,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import { BosonHoverMenu, BosonMenu } from './BosonMenu';
import HeaderIconButton, { HeaderIconButtonProps } from './HeaderIconButton';

export interface BosonHoverMenuProps {
  name: string;
  Icon: OverridableComponent<SvgIconTypeMap>;
  children: React.ReactNode;
  hover?: boolean;
  IconButtonProps?: HeaderIconButtonProps;
}

export default function BosonIconMenu(props: BosonHoverMenuProps) {
  const { name, Icon, children, hover = false, IconButtonProps = {} } = props;

  const popupState = usePopupState({ variant: 'popover', popupId: name });

  const MenuClass = hover ? BosonHoverMenu : BosonMenu;

  return (
    <>
      <HeaderIconButton
        {...bindHover(popupState)}
        Icon={Icon}
        {...{ ...{ sx: { px: 0 } }, ...IconButtonProps }}
      />
      <MenuClass {...bindMenu(popupState)}>{children}</MenuClass>
    </>
  );
}
