/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: BosonInputBase.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { InputBase, styled } from '@mui/material';

const BosonInputBase = styled(InputBase)(({ theme }) => ({
  padding: '0px 6px',
  borderRadius: '4px',
  position: 'relative',
  backgroundColor: theme.palette.mode === 'light' ? '#E3E5E8' : '#202225',
  color: theme.palette.action.active,
  border: 'none',
}));

export default BosonInputBase;
