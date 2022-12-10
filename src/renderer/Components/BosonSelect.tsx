/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: BosonSelect.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Select, SelectProps, styled } from '@mui/material';

const BosonSelectRoot = styled(Select)(({ theme }) => ({
  height: 35,
  // width: 80,
  borderRadius: '4px',
  backgroundColor: theme.palette.mode === 'light' ? '#E3E5E8' : '#202225',
  color: theme.palette.action.active,
  border: 'none',
  padding: '0px 6px',
  fontWeight: 500,
  transition: 'all 0.5s ease 0s',
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

export default function BosonSelect(props: SelectProps) {
  return (
    <BosonSelectRoot
      MenuProps={{
        anchorOrigin: { vertical: 35, horizontal: 'center' },
        PaperProps: {
          elevation: 0,
          sx: (theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#18191C' : '#fff',
            px: 0.25,
            py: 0,
          }),
        },
      }}
      {...props}
    />
  );
}
