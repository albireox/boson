/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: guideTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import telescope from '@iconify/icons-mdi/telescope';
import { Icon } from '@iconify/react';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';
import { ValidatedNumberInput } from 'renderer/components/validatedInput';

/** @jsxImportSource @emotion/react */

const OffsetInput = styled(ValidatedNumberInput)({ minWidth: '250px' });

export const GuideTable = () => {
  const nullInput = {
    ra: '',
    dec: '',
    rot: '',
    focus: '',
    scale: ''
  };

  const [userInput, setUserInput] = React.useState(nullInput);
  const [applying, setApplying] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name.split('-')[1];
    setUserInput({ ...userInput, [name]: e.target.value });
  };

  const clearInput = (e: React.MouseEvent) => {
    setUserInput(nullInput);
    setApplying(false);
  };

  const handleApply = (e: React.MouseEvent) => {
    setApplying(true);
  };

  return (
    <Paper variant='outlined' sx={{ width: '100%' }}>
      <Table size='small' sx={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align='right'>Net Off</TableCell>
            <TableCell align='right'>Meas Err</TableCell>
            <TableCell align='right'>Corr</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {/* RA */}
          <TableRow>
            <TableCell>RA</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align='right'>
              <OffsetInput
                name='user-ra'
                value={userInput.ra}
                onChange={handleInputChange}
                endAdornment='arcsec'
              />
            </TableCell>
          </TableRow>
          {/* Dec */}
          <TableRow>
            <TableCell>Dec</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align='right'>
              <OffsetInput
                name='user-dec'
                value={userInput.dec}
                onChange={handleInputChange}
                endAdornment='arcsec'
              />
            </TableCell>
          </TableRow>
          {/* Rot */}
          <TableRow>
            <TableCell>Rot</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align='right'>
              <OffsetInput
                name='user-rot'
                value={userInput.rot}
                onChange={handleInputChange}
                endAdornment='arcsec'
              />
            </TableCell>
          </TableRow>
          {/* Focus */}
          <TableRow>
            <TableCell>Focus</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align='right'>
              <OffsetInput
                name='user-focus'
                value={userInput.focus}
                onChange={handleInputChange}
                endAdornment='&micro;m'
              />
            </TableCell>
          </TableRow>
          {/* Scale */}
          <TableRow>
            <TableCell>Scale</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align='right'>
              <OffsetInput
                name='user-scale'
                value={userInput.scale}
                onChange={handleInputChange}
                endAdornment='1e6'
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Stack direction='row-reverse' spacing={1} p={1}>
        <LoadingButton
          onClick={handleApply}
          endIcon={<Icon icon={telescope} />}
          loading={applying}
          loadingPosition='end'
          variant='contained'
        >
          Apply
        </LoadingButton>
        <Button variant='outlined' onClick={clearInput}>
          Clear
        </Button>
      </Stack>
    </Paper>
  );
};
