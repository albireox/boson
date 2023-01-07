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
import AxisOffsetInput from './AxisOffsetInput';

LicenseInfo.setLicenseKey(
  '4a02c3ec30f1345b19d444a2c24c94beT1JERVI6MzYyNzgsRVhQSVJZPTE2NzQyMzE0NDgwMDAsS0VZVkVSU0lPTj0x'
);

function Sep() {
  return <span style={{ color: 'gray', margin: '0px 8px' }}>|</span>;
}

export default function GuideTable() {
  const keywords = useKeywordContext();

  const [pidRA, setPidRA] = React.useState([0.0, 0.0, 0.0]);
  const [pidDec, setPidDec] = React.useState([0.0, 0.0, 0.0]);
  const [pidRot, setPidRot] = React.useState([0.0, 0.0, 0.0]);
  const [pidFocus, setPidFocus] = React.useState([0.0, 0.0, 0.0]);

  const [measured, setMeasured] = React.useState([0.0, 0.0, 0.0, 0.0, 0.0]);
  const [applied, setApplied] = React.useState([0.0, 0.0, 0.0, 0.0, 0.0]);

  const [focusMeasured, setFocusMeasured] = React.useState<number>(0.0);

  const { astrometry_fit: astrometryFit } = keywords;

  React.useEffect(() => {
    // Clear the applied offsets when a new measurements arrives.
    if (astrometryFit) {
      setMeasured(astrometryFit.values.slice(-4));
      setApplied([0.0, 0.0, 0.0, 0.0, 0.0]);
    }
  }, [astrometryFit]);

  const { correction_applied: correctionApplied } = keywords;

  React.useEffect(() => {
    if (correctionApplied) setApplied(correctionApplied.values);
  }, [correctionApplied]);

  React.useEffect(() => {
    const {
      pid_ra: pidRAKw,
      pid_dec: pidDecKw,
      pid_rot: pidRotKw,
      pid_focus: pidFocusKw,
      focus_fit: focusFit,
    } = keywords;

    if (pidRAKw) setPidRA(pidRAKw.values);
    if (pidDecKw) setPidDec(pidDecKw.values);
    if (pidRotKw) setPidRot(pidRotKw.values);
    if (pidFocusKw) setPidFocus(pidFocusKw.values);
    if (focusFit) setFocusMeasured(focusFit.values[6]);
  }, [keywords]);

  const columns: GridColDef[] = [
    {
      field: 'axis',
      headerName: 'Axis',
      sortable: false,
      flex: 0.1,
    },
    {
      field: 'measured',
      headerName: 'Measured',
      description: 'Raw value measured from the guider fit',
      flex: 0.2,
      align: 'right',
      sortable: false,
      headerAlign: 'right',
    },
    {
      field: 'applied',
      headerName: 'Applied',
      description:
        'Correction applied in the last iteration, including the PID scaling',
      align: 'right',
      flex: 0.2,
      sortable: false,
      headerAlign: 'right',
    },
    {
      field: 'pid',
      headerName: 'PID',
      description: 'PID parameters for the axis [Kp]',
      sortable: false,
      align: 'right',
      flex: 0.15,
      headerAlign: 'right',
      renderCell: (params) =>
        params.row.pid && (
          <div>
            {params.row.pid[0]}
            <Sep />
            {params.row.pid[1]}
            <Sep />
            {params.row.pid[2]}
          </div>
        ),
    },
    {
      field: 'offset',
      headerName: 'Offset',
      description:
        'Manual offset to send to the axis, in arcsec except for focus which are \u00b5m',
      headerAlign: 'right',
      sortable: false,
      flex: 0.3,
      align: 'right',
      renderCell: (params) => {
        return <AxisOffsetInput axis={params.row.axis} />;
      },
    },
  ];

  const rows = [
    {
      id: 1,
      axis: 'RA',
      measured: measured[0] && measured[0] > -999 ? measured[0] : '-',
      applied: applied[0],
      pid: pidRA,
    },
    {
      id: 2,
      axis: 'Declination',
      measured: measured[1] && measured[1] > -999 ? measured[1] : '-',
      applied: applied[1],
      pid: pidDec,
    },
    {
      id: 3,
      axis: 'Rotator',
      measured: measured[2] && measured[2] > -999 ? measured[2] : '-',
      applied: applied[2],
      pid: pidRot,
    },
    {
      id: 4,
      axis: 'Focus',
      measured: focusMeasured && focusMeasured > -999 ? focusMeasured : '-',
      applied: applied[4],
      pid: pidFocus,
    },
    {
      id: 5,
      axis: 'Scale',
      measured: measured[3] && measured[3] > -999 ? measured[3] : '-',
      applied: '',
    },
  ];

  return (
    <Box width='100%' pt={0.5}>
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
