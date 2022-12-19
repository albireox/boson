/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: ResetButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Tooltip } from '@mui/material';
import HeaderIconButton from 'renderer/Components/HeaderIconButton';
import { useLogConfig } from '../hooks';

export default function ResetButton() {
  const { reset } = useLogConfig();

  return (
    <HeaderIconButton
      sx={{
        px: 0,
      }}
      onClick={reset}
    >
      <Tooltip title='Reset settings'>
        <RestartAltIcon sx={{ fontSize: '20px' }} />
      </Tooltip>
    </HeaderIconButton>
  );
}
