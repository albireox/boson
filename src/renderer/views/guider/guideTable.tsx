/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: guideTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Send } from '@mui/icons-material';
import { IconButton, OutlinedInput } from '@mui/material';
import { Box } from '@mui/system';
import { DataGridPro, GridColDef, LicenseInfo } from '@mui/x-data-grid-pro';
import React from 'react';
import { useKeywords } from 'renderer/hooks';

/** @jsxImportSource @emotion/react */

LicenseInfo.setLicenseKey(
  '4a02c3ec30f1345b19d444a2c24c94beT1JERVI6MzYyNzgsRVhQSVJZPTE2NzQyMzE0NDgwMDAsS0VZVkVSU0lPTj0x'
);

const AxisOffsetInput = (params: { axis: string }) => {
  let { axis } = params;

  const [offset, setOffset] = React.useState('');
  const [error, setError] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);

  axis = axis.toLowerCase();

  if (['scale', 'focus'].includes(axis)) return <div />;

  const handleClick = () => {
    if (offset === '') return;

    if (Number.isNaN(Number(offset))) {
      setError(true);
      return;
    }

    const offsetDeg = Number(offset) / 3600;

    let command: string;

    switch (axis) {
      case 'ra':
        command = `tcc offset arc ${offsetDeg}, 0.0 /computed`;
        break;
      case 'declination':
        command = `tcc offset arc 0.0, ${offsetDeg} /computed`;
        break;
      case 'rotator':
        command = `tcc offset guide 0.0, 0.0, ${offsetDeg} /computed`;
        break;
      default:
        return;
    }

    setDisabled(true);
    window.api.tron
      .send(command)
      .catch(() => setError(true))
      .finally(() => {
        setDisabled(false);
        setOffset('');
      });
  };

  return (
    <OutlinedInput
      error={error}
      disabled={disabled}
      value={offset}
      size='small'
      sx={{ minWidth: '150px', pr: '5px' }}
      onChange={(e) => {
        setOffset(e.target.value);
        setError(false);
      }}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      endAdornment={
        <IconButton
          disabled={disabled}
          size='small'
          sx={{ opacity: 0.5 }}
          disableFocusRipple
          onClick={handleClick}
        >
          <Send fontSize='small' />
        </IconButton>
      }
    />
  );
};

export const GuideTable = () => {
  const keywords = useKeywords([
    'cherno.pid_radec',
    'cherno.pid_rot',
    'cherno.correction_applied',
    'cherno.did_correct',
    'cherno.acquisition_valid',
    'cherno.astrometry_fit'
  ]);

  const [pid, setPid] = React.useState<number[]>([0.0, 0.0]);
  const [measured, setMeasured] = React.useState<number[]>([0.0, 0.0, 0.0, 0.0]);
  const [applied, setApplied] = React.useState<number[]>([0.0, 0.0, 0.0]);

  React.useEffect(() => {
    keywords['cherno.pid_radec'] && setPid((d) => [keywords['cherno.pid_radec'].values[0], d[1]]);
    keywords['cherno.pid_rot'] && setPid((d) => [d[0], keywords['cherno.pid_rot'].values[0]]);

    const astrometry_fit = keywords['cherno.astrometry_fit'];
    if (astrometry_fit) setMeasured(astrometry_fit.values.slice(-4));

    const correction_applied = keywords['cherno.correction_applied'];
    if (correction_applied) setApplied(correction_applied.values);
  }, [keywords]);

  const columns: GridColDef[] = [
    {
      field: 'axis',
      headerName: 'Axis',
      sortable: false,
      flex: 0.1
    },
    {
      field: 'measured',
      headerName: 'Measured',
      description: 'Raw value measured from the guider fit',
      flex: 0.2,
      align: 'right',
      sortable: false,
      headerAlign: 'right'
    },
    {
      field: 'applied',
      headerName: 'Applied',
      description: 'Correction applied in the last iteration, including the PID scaling',
      align: 'right',
      flex: 0.2,
      sortable: false,
      headerAlign: 'right'
    },
    {
      field: 'pid',
      headerName: 'PID',
      description: 'PID parameters for the axis [Kp]',
      sortable: false,
      align: 'right',
      flex: 0.1,
      headerAlign: 'right'
    },
    {
      field: 'offset',
      headerName: 'Offset',
      description: 'Manual offset to send to the axis, in arcsec except for focus which are mm',
      headerAlign: 'right',
      sortable: false,
      flex: 0.3,
      align: 'right',
      renderCell: (params) => {
        return <AxisOffsetInput axis={params.row.axis} />;
      }
    }
  ];

  const rows = [
    { id: 1, axis: 'RA', measured: measured[0], applied: applied[0], pid: pid[0] },
    { id: 2, axis: 'Declination', measured: measured[1], applied: applied[1], pid: pid[0] },
    { id: 3, axis: 'Rotator', measured: measured[2], applied: applied[2], pid: pid[1] },
    { id: 4, axis: 'Scale', measured: measured[3], applied: '' },
    { id: 5, axis: 'Focus', measured: '', applied: '' }
  ];
  return (
    <Box width='100%' py={2}>
      <DataGridPro
        autoHeight
        rows={rows}
        columns={columns}
        pagination={false}
        hideFooter
        disableSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            ':focus': {
              outline: 'unset'
            },
            ':focus-within': {
              outline: 'unset'
            }
          }
        }}
      />
    </Box>
  );
};
