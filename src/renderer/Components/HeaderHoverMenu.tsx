/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: HeaderHoverMenu.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { MenuProps, styled } from '@mui/material';
import HoverMenu from 'material-ui-popup-state/HoverMenu';

const HeaderHoverMenu = styled((props: MenuProps) => (
  <HoverMenu
    anchorOrigin={{ vertical: 30, horizontal: 'center' }}
    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    PaperProps={{
      elevation: 0,
      sx: (theme) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#18191C' : '#fff',
        px: 0.25,
        py: 0,
      }),
    }}
    {...props}
  />
))({});

export default HeaderHoverMenu;
