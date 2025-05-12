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
  const { SecState: secState } = useKeywordContext();
  const { PrimState: primState } = useKeywordContext();

  const [altStatus, setAltStatus] = React.useState('?');
  const [azStatus, setAzStatus] = React.useState('?');
  const [rotStatus, setRotStatus] = React.useState('?');

  const [altPos, setAltPos] = React.useState('?');
  const [azPos, setAzPos] = React.useState('?');
  const [rotPos, setRotPos] = React.useState('?');

  const [primStatus, setPrimStatus] = React.useState('?');
  const [secStatus, setSecStatus] = React.useState('?');

  React.useEffect(() => {
      if (!axisCmdState) return;

      const azState: string = axisCmdState.values[0];
      const altState: string = axisCmdState.values[1];
      const rotState: string = axisCmdState.values[2];

      setAltStatus(altState);
      setAzStatus(azState);
      setRotStatus(rotState);
      console.log("axis cmd state");
      console.log(azState);
      console.log(altState);
      console.log(rotState);

    }, [axisCmdState]);


  React.useEffect(() => {
      if (!tccPos) return;

      const azPos: string = tccPos.values[0];
      const altPos: string = tccPos.values[1];
      const rotPos: string = tccPos.values[2];

      setAltPos(altPos);
      setAzPos(azPos);
      setRotPos(rotPos);
      // console.log("tcc pos state");
      // console.log(azPos);
      // console.log(altPos);
      // console.log(rotPos);

    }, [tccPos]);

  React.useEffect(() => {
      if (!secState) return;

      const ss: string = secState.values[0];

      setSecStatus(ss);

    }, [secState]);

  React.useEffect(() => {
      if (!primState) return;

      const ss: string = primState.values[0];

      setPrimStatus(ss);

    }, [primState]);

  return (
    <Stack direction="column" spacing={1}>
    <Stack direction='row' spacing={4}>
        <Chip label={`AZ: ${azStatus}`} sx={{ fontSize: '1rem', height: '30px' }}/>
        <Chip label={`ALT: ${altStatus}`} sx={{ fontSize: '1rem', height: '30px' }}/>
        <Chip label={`ROT: ${rotStatus}`} sx={{ fontSize: '1rem', height: '30px' }}/>
        <Chip label={`M1: ${primStatus}`} sx={{ fontSize: '1rem', height: '30px' }}/>
        <Chip label={`M2: ${secStatus}`} sx={{ fontSize: '1rem', height: '30px' }}/>
    </Stack>
    <Stack direction='row' spacing={9}>
        <Chip label={azPos} sx={{ fontSize: '1rem', height: '30px' }}/>
        <Chip label={altPos} sx={{ fontSize: '1rem', height: '30px' }}/>
        <Chip label={rotPos} sx={{ fontSize: '1rem', height: '30px' }}/>
    </Stack>
    </Stack>
  );
}
