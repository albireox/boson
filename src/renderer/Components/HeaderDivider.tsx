/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: HeaderDivider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Divider } from '@mui/material';
import { styled } from '@mui/system';

const HeaderDivider = styled(Divider)(({ theme }) => ({
  border: 'none',
  borderBottom:
    theme.palette.mode === 'dark' ? '0.5px solid #202225' : '0.5px solid #666',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 0.5px 0.5px 0px #202225'
      : '0 0.1px 0.1px 0px #333',
}));

export default HeaderDivider;
