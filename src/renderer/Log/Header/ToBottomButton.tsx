/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: ToBottomButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Tooltip } from '@mui/material';
import HeaderIconButton from 'renderer/Components/HeaderIconButton';
import { ViewportRefType } from '..';

interface ToBottomButtonProps {
  viewportRef: React.RefObject<ViewportRefType>;
}

export default function ToBottomButton(props: ToBottomButtonProps) {
  const { viewportRef } = props;

  return (
    <HeaderIconButton
      sx={{
        px: 0,
      }}
      onClick={() => viewportRef.current?.gotoBottom()}
    >
      <Tooltip title='Go to bottom'>
        <ArrowDownwardIcon sx={{ fontSize: '20px' }} />
      </Tooltip>
    </HeaderIconButton>
  );
}
