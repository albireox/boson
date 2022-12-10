/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: WrapButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import WrapTextIcon from '@mui/icons-material/WrapText';
import { Tooltip } from '@mui/material';
import HeaderIconButton from 'renderer/Components/HeaderIconButton';
import { useLogConfig } from '../hooks';

export default function WrapButton() {
  const { config, toggleWrap } = useLogConfig();

  return (
    <HeaderIconButton
      sx={(theme) => ({
        px: 0,
        color: config.wrap ? theme.palette.text.primary : undefined,
      })}
      onClick={toggleWrap}
    >
      <Tooltip title='Wrap lines'>
        <WrapTextIcon sx={{ fontSize: '20px' }} />
      </Tooltip>
    </HeaderIconButton>
  );
}
