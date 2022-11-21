/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-20
 *  @Filename: PreferencesRadioGroup.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { RadioGroup, styled } from '@mui/material';

const PreferencesRadioGroup = styled(RadioGroup)(({ theme }) => ({
  '& .MuiFormControlLabel-root': {
    marginTop: theme.spacing(0.75),
    padding: theme.spacing(0.5, 1),
    paddingLeft: theme.spacing(2),
    '& .MuiButtonBase-root': {
      color: theme.palette.action.active,
    },
    '& .Mui-checked': {
      color: theme.palette.action.active,
    },
  },

  '& .MuiFormControlLabel-label': {
    color: theme.palette.action.active,
  },
}));

export default PreferencesRadioGroup;
