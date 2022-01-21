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

/** @jsxImportSource @emotion/react */

LicenseInfo.setLicenseKey(
  '4a02c3ec30f1345b19d444a2c24c94beT1JERVI6MzYyNzgsRVhQSVJZPTE2NzQyMzE0NDgwMDAsS0VZVkVSU0lPTj0x'
);

const AxisOffsetInput = (params: { axis: string }) => {
  const { axis } = params;

  return (
    <OutlinedInput
      size='small'
      sx={{ minWidth: '150px', pr: '5px' }}
      endAdornment={
        <IconButton size='small' sx={{ opacity: 0.3 }} disableFocusRipple>
          <Send fontSize='small' />
        </IconButton>
      }
    />
  );
};

export const GuideTable = () => {
  const columns: GridColDef[] = [
    {
      field: 'axis',
      headerName: 'Axis',
      flex: 0.1
    },
    {
      field: 'measured',
      headerName: 'Measured',
      description: 'Raw value measured from the guider fit',
      type: 'number',
      flex: 0.2
    },
    {
      field: 'applied',
      headerName: 'Applied',
      description: 'Correction applied in the last iteration, including the PID scaling',
      type: 'number',
      flex: 0.2
    },
    {
      field: 'pid',
      headerName: 'PID',
      description: 'PID parameters for the axis [Kp]',
      sortable: false,
      flex: 0.1
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
    { id: 1, axis: 'RA', measured: 0.0, applied: 0.0 },
    { id: 2, axis: 'Declination', measured: 0.0, applied: 0.0 },
    { id: 3, axis: 'Rotator', measured: 0.0, applied: 0.0 },
    { id: 4, axis: 'Scale', measured: 0.0, applied: '' },
    { id: 5, axis: 'Focus', measured: 0.0, applied: 0.0 }
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
