/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-29
 *  @Filename: ExposeRow.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack } from '@mui/system';
import AstrometryFitChips from './AstrometryFitChips';
import AxesSelector from './AxesSelector';
import ExposeButtons from './ExposeButtons';
import ExposureStatusChip from './ExposureStatusChip';

export default function ExposeRow() {
  return (
    <Stack direction='row' spacing={2}>
      <AxesSelector />
      <Stack direction='row' spacing={0.5}>
        <ExposureStatusChip />
        <AstrometryFitChips />
      </Stack>
      <Box flexGrow={1} />
      <ExposeButtons />
    </Stack>
  );
}
