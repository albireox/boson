/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-29
 *  @Filename: ExposeRow.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack } from '@mui/system';
import { Chip } from '@mui/material';
import { useKeywordContext } from 'renderer/hooks';
import React from 'react';
import { DataGridPro, GridColDef, LicenseInfo } from '@mui/x-data-grid-pro';

export default function StatusRow() {

  const { AxisCmdState: axisCmdState } = useKeywordContext();
  const { TCCPos: tccPos } = useKeywordContext();
  const { AxePos: axePos } = useKeywordContext();

  const [altStatus, setAltStatus] = React.useState('?');
  const [azStatus, setAzStatus] = React.useState('?');
  const [rotStatus, setRotStatus] = React.useState('?');

  const [altPos, setAltPos] = React.useState('?');
  const [azPos, setAzPos] = React.useState('?');
  const [rotPos, setRotPos] = React.useState('?');

  React.useEffect(() => {
      if (!axisCmdState) return;

      const azState: string = axisCmdState.values[0];
      const altState: string = axisCmdState.values[1];
      const rotState: string = axisCmdState.values[2];

      setAltStatus(altState);
      setAzStatus(azState);
      setRotStatus(rotState);
      // console.log("axis cmd state");
      // console.log(azState);
      // console.log(altState);
      // console.log(rotState);

    }, [axisCmdState]);


  React.useEffect(() => {
      if (!axePos) return;

      const _azPos: string = axePos.values[0].toString().slice(0,6);
      const _altPos: string = axePos.values[1].toString().slice(0,6);
      const _rotPos: string = axePos.values[2].toString().slice(0,6);

      setAltPos(_altPos);
      setAzPos(_azPos);
      setRotPos(_rotPos);
      // console.log("tcc pos state");
      // console.log(azPos);
      // console.log(altPos);
      // console.log(rotPos);

    }, [axePos]);


  return (
    <Stack direction="column" spacing={1}>
    <Stack direction='row' spacing={4}>
        <Chip label={`AZ: ${azPos} [${azStatus}]`} sx={{ fontSize: '1rem', height: '30px' }}/>
        <Chip label={`ALT: ${altPos} [${altStatus}]`} sx={{ fontSize: '1rem', height: '30px' }}/>
        <Chip label={`ROT: ${rotPos} [${rotStatus}]`} sx={{ fontSize: '1rem', height: '30px' }}/>
    </Stack>
    </Stack>
  );
}
