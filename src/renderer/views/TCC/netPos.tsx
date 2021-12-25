/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-07
 *  @Filename: netPos.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, LinearProgress, LinearProgressProps, Typography } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import * as React from 'react';
import { AlertChip } from 'renderer/components/chip';
import { useKeywords } from 'renderer/hooks';
import { degToDMS } from 'utils';
import { Deg, DMG, TCCTable } from './index';

interface CoordState {
  [key: string]: null | string | JSX.Element;
}

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number; hidden?: boolean }
) {
  return (
    <Box display='flex' alignItems='center' hidden={props.hidden || false}>
      <Box width='100%' mr={1}>
        <LinearProgress color='secondary' variant='determinate' {...props} />
      </Box>
      <Box minWidth={35} hidden={props.hidden || false}>
        <Typography variant='body1'>{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const NetPosTable: React.FC<{ style?: { [key: string]: any } }> = (props) => {
  let keywords = useKeywords(
    ['tcc.objNetPos', 'tcc.objSys', 'tcc.rotPos', 'tcc.rotType'],
    'tcc-netpos-keywords'
  );
  let [coordState, setCoordState] = React.useState<CoordState>({
    axis1label: null,
    axis1value: null,
    axis1units: null,
    axis2label: null,
    axis2value: null,
    axis2units: null
  });
  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 10 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    let cSysObj = keywords['tcc.objSys']?.values[0] || 'unknown';
    let axis1value = keywords['tcc.objNetPos']?.values[0];
    let newCoordState: CoordState = {};

    if (['ICRS', 'FK4', 'FK5'].includes(cSysObj)) {
      newCoordState.axis1label = 'RA';
      newCoordState.axis2label = 'Dec';
      newCoordState.axis1units = 'hms';
      newCoordState.axis2units = <DMG />;
      axis1value /= 15; // Convert to hours
    } else if (cSysObj === 'Mount') {
      newCoordState.axis1label = 'Az';
      newCoordState.axis2label = 'Alt';
      newCoordState.axis1units = <DMG />;
      newCoordState.axis2units = <DMG />;
    } else {
      newCoordState.axis1label = 'Az';
      newCoordState.axis2label = 'Alt';
      newCoordState.axis1units = '?';
      newCoordState.axis2units = '?';
    }

    newCoordState.axis1value = degToDMS(axis1value, { precision: 2 });
    newCoordState.axis2value = degToDMS(keywords['tcc.objNetPos']?.values[3], {
      precision: 2
    });

    setCoordState(newCoordState);
  }, [keywords]);

  const getRot = (rotPos: number | undefined | string) => {
    if (
      rotPos === undefined ||
      rotPos === null ||
      Number.isNaN(rotPos) ||
      typeof rotPos === 'string' // For the case when returns nan
    ) {
      return null;
    }
    return rotPos.toFixed(2);
  };

  return (
    <TableContainer style={{ overflow: 'hidden', verticalAlign: 'top' }}>
      <TCCTable style={props.style}>
        <TableHead>
          <TableRow>
            <TableCell width='50px' />
            <TableCell width='120px' />
            <TableCell width='30px' />
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align='right'>{coordState.axis1label}</TableCell>
            <TableCell align='right'>{coordState.axis1value}</TableCell>
            <TableCell align='left' colSpan={2}>
              {coordState.axis1units}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>{coordState.axis2label}</TableCell>
            <TableCell align='right'>{coordState.axis2value}</TableCell>
            <TableCell align='left'>{coordState.axis2units}</TableCell>
            <TableCell align='center' rowSpan={2} style={{ padding: '0px 32px 0px 64px' }} />
          </TableRow>
          <TableRow>
            <TableCell align='right'>CSys</TableCell>
            <TableCell align='right'>
              <AlertChip
                label={keywords['tcc.objSys']?.values[0] || 'N/A'}
                severity='info'
                variant='outlined'
                size='small'
                style={{ height: '18px' }}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Rot</TableCell>
            <TableCell align='right'>{getRot(keywords['tcc.rotPos']?.values[0])}</TableCell>
            <TableCell align='left'>{keywords['tcc.rotPos'] ? <Deg /> : null}</TableCell>
            <TableCell align='left'>
              <AlertChip
                label={keywords['tcc.rotType']?.values[0] || 'N/A'}
                severity='info'
                variant='outlined'
                size='small'
                style={{ height: '18px' }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </TCCTable>
    </TableContainer>
  );
};

export default NetPosTable;
