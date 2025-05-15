/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: GuideTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box } from '@mui/system';
import { DataGridPro, GridColDef, LicenseInfo } from '@mui/x-data-grid-pro';
import React from 'react';
import { useKeywordContext } from 'renderer/hooks';

LicenseInfo.setLicenseKey(
  '4a02c3ec30f1345b19d444a2c24c94beT1JERVI6MzYyNzgsRVhQSVJZPTE2NzQyMzE0NDgwMDAsS0VZVkVSU0lPTj0x'
);

function Sep() {
  return <span style={{ color: 'gray', margin: '8px 8px' }}>|</span>;
}

export default function MirrorTable() {
  // const keywords = useKeywordContext();
  const { PrimOrient: primOrient } = useKeywordContext();
  const { SecOrient: secOrient } = useKeywordContext();
  const { SecState: secState } = useKeywordContext();
  const { PrimState: primState } = useKeywordContext();

  const [po, setPO] = React.useState([0.0, 0.0, 0.0, 0.0, 0.0]);
  const [so, setSO] = React.useState([0.0, 0.0, 0.0, 0.0, 0.0]);
  const [ps, setPS] = React.useState("?");
  const [ss, setSS] = React.useState("?");

  React.useEffect(() => {
    if (!primOrient) return;
    setPO([
      primOrient.values[0],
      primOrient.values[1],
      primOrient.values[2],
      primOrient.values[3],
      primOrient.values[4],
    ]);

  }, [primOrient]);

  React.useEffect(() => {
    if (!secOrient) return;
    setSO([
      secOrient.values[0],
      secOrient.values[1],
      secOrient.values[2],
      secOrient.values[3],
      secOrient.values[4],
    ]);

  }, [secOrient]);

  React.useEffect(() => {
      if (!primState) return;

      const ss: string = primState.values[0];

      setPS(ss);

    }, [primState]);

  React.useEffect(() => {
      if (!secState) return;

      const ss: string = secState.values[0];

      setSS(ss);

    }, [secState]);

  // const [pidRA, setPidRA] = React.useState([0.0, 0.0, 0.0]);
  // const [pidDec, setPidDec] = React.useState([0.0, 0.0, 0.0]);
  // const [pidRot, setPidRot] = React.useState([0.0, 0.0, 0.0]);
  // const [pidFocus, setPidFocus] = React.useState([0.0, 0.0, 0.0]);

  // const [measured, setMeasured] = React.useState([0.0, 0.0, 0.0, 0.0, 0.0]);
  // const [applied, setApplied] = React.useState([0.0, 0.0, 0.0, 0.0, 0.0]);

  // const [focusMeasured, setFocusMeasured] = React.useState<number>(0.0);

  // const { astrometry_fit: astrometryFit } = keywords;

  // React.useEffect(() => {
  //   // Clear the applied offsets when a new measurements arrives.
  //   if (astrometryFit) {
  //     setMeasured(astrometryFit.values.slice(-4));
  //     setApplied([0.0, 0.0, 0.0, 0.0, 0.0]);
  //   }
  // }, [astrometryFit]);

  // const { correction_applied: correctionApplied } = keywords;

  // React.useEffect(() => {
  //   if (correctionApplied) setApplied(correctionApplied.values);
  // }, [correctionApplied]);

  // React.useEffect(() => {
  //   const {
  //     pid_ra: pidRAKw,
  //     pid_dec: pidDecKw,
  //     pid_rot: pidRotKw,
  //     pid_focus: pidFocusKw,
  //     focus_fit: focusFit,
  //   } = keywords;

  //   if (pidRAKw) setPidRA(pidRAKw.values);
  //   if (pidDecKw) setPidDec(pidDecKw.values);
  //   if (pidRotKw) setPidRot(pidRotKw.values);
  //   if (pidFocusKw) setPidFocus(pidFocusKw.values);
  //   if (focusFit) setFocusMeasured(focusFit.values[6]);
  // }, [keywords]);

  const columns: GridColDef[] = [
    {
      field: 'mirror',
      headerName: 'Mirror',
      sortable: false,
      // flex: 0.1,
      width: 45,
    },
    {
      field: 'state',
      headerName: 'State',
      sortable: false,
      // flex: 0.1,
      width: 60,
    },
    {
      field: 'piston',
      headerName: 'Piston (um)',
      sortable: false,
      // flex: 0.1,
      width: 100,
    },
    {
      field: 'xtilt',
      headerName: 'X Tilt (")',
      sortable: false,
      // flex: 0.1,
      width: 100,
    },
    {
      field: 'ytilt',
      headerName: 'Y Tilt (")',
      sortable: false,
      // flex: 0.1,
      width: 100,
    },
    {
      field: 'xtrans',
      headerName: 'X Trans  (um)',
      sortable: false,
      // flex: 0.1,
      width: 100,
    },
    {
      field: 'ytrans',
      headerName: 'Y Trans  (um)',
      sortable: false,
      // flex: 0.1,
      width: 100,
    },
  ]

  const rows = [
    {
      id: 1,
      mirror: 'M1',
      state: ps,
      piston: po[0],
      xtilt: po[1],
      ytilt: po[2],
      xtrans: po[3],
      ytrans: po[4]
    },
    {
      id: 2,
      mirror: 'M2',
      state: ss,
      piston: so[0],
      xtilt: so[1],
      ytilt: so[2],
      xtrans: so[3],
      ytrans: so[4]
    },
  ];

  return (
    <Box width='50%' pt={0.5}>
      <DataGridPro
        autoHeight
        headerHeight={40}
        rowHeight={45}
        rows={rows}
        columns={columns}
        pagination={false}
        hideFooter
        disableSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            ':focus': {
              outline: 'unset',
            },
            ':focus-within': {
              outline: 'unset',
            },
          },
        }}
      />
    </Box>
  );
}
