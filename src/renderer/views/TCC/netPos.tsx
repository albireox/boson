/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-07
 *  @Filename: netPos.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, LinearProgress, LinearProgressProps, Typography } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { degToDMS } from 'utils';
import { TCCTable } from './index';

interface CoordState {
  [key: string]: null | string;
}

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number; hidden?: boolean }
) {
  return (
    <Box display='flex' alignItems='center' hidden={props.hidden || false}>
      <Box width='100%' mr={1}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box minWidth={35} hidden={props.hidden || false}>
        <Typography variant='body2' color='textSecondary'>{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export const NetPosTable: React.FC<{ style?: { [key: string]: any } }> = (props) => {
  let keywords = useKeywords(
    ['tcc.objnetpos', 'tcc.objsys', 'tcc.rotpos', 'tcc.rottype'],
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
    let cSysObj = keywords['tcc.objsys']?.values[0] || 'unknown';
    let axis1value = keywords['tcc.objnetpos']?.values[0];
    let newCoordState: CoordState = {};

    if (['ICRS', 'FK4', 'FK5'].includes(cSysObj)) {
      newCoordState.axis1label = 'RA';
      newCoordState.axis2label = 'Dec';
      newCoordState.axis1units = 'hms';
      newCoordState.axis2units = '\u00b0 \' "';
      axis1value /= 15; // Convert to hours
    } else if (cSysObj === 'Mount') {
      newCoordState.axis1label = 'Az';
      newCoordState.axis2label = 'Alt';
      newCoordState.axis1units = '\u00b0 \' "';
      newCoordState.axis2units = '\u00b0 \' "';
    } else {
      newCoordState.axis1label = '?';
      newCoordState.axis2label = '?';
      newCoordState.axis1units = '?';
      newCoordState.axis2units = '?';
    }

    newCoordState.axis1value = degToDMS(axis1value, { precision: 2 });
    newCoordState.axis2value = degToDMS(keywords['tcc.objnetpos']?.values[3], {
      precision: 2,
      sign: true
    });

    setCoordState(newCoordState);
  }, [keywords]);

  const getRot = (rotPos: number | undefined) => {
    if (rotPos === undefined || rotPos === null) {
      return null;
    }
    return rotPos.toFixed(2) + ' \u00b0';
  };

  return (
    <TableContainer style={{ overflow: 'hidden', verticalAlign: 'top' }}>
      <TCCTable style={props.style}>
        <TableHead>
          <TableRow>
            <TableCell width='20px' />
            <TableCell width='80px' />
            <TableCell width='40px' />
            <TableCell width='300px' />
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
            <TableCell align='center' rowSpan={2} style={{ padding: '0px 32px' }}>
              <LinearProgressWithLabel value={progress} hidden />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>CSys</TableCell>
            <TableCell align='right'>{keywords['tcc.objsys']?.values[0]}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Rot</TableCell>
            <TableCell align='right'>{getRot(keywords['tcc.rotpos']?.values[0])}</TableCell>
            <TableCell align='left' colSpan={2}>
              {keywords['tcc.rottype']?.values[0]}
            </TableCell>
          </TableRow>
        </TableBody>
      </TCCTable>
    </TableContainer>
  );
};
