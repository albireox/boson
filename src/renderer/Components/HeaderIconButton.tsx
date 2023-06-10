/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: HeaderIconButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  IconButton,
  IconButtonProps,
  styled,
  SvgIconTypeMap,
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

export interface HeaderIconButtonProps extends IconButtonProps {
  Icon?: OverridableComponent<SvgIconTypeMap>;
}

const HeaderIconButton = styled((props: HeaderIconButtonProps) => {
  const { Icon, ...rest } = props;
  if (Icon) rest.children = <Icon sx={{ fontSize: '24px' }} />;
  return (
    <IconButton disableRipple disableFocusRipple disableTouchRipple {...rest} />
  );
})(({ theme }) => ({
  WebkitAppRegion: 'no-drag',
  py: 0,
  px: 1,
  color: theme.palette.text.secondary,
  '&:hover': { backgroundColor: 'unset', color: theme.palette.text.primary },
}));

export default HeaderIconButton;
