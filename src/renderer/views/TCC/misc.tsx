/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-07
 *  @Filename: misc.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableProps,
  TableRow
} from '@mui/material';
import * as React from 'react';
import { useKeywords, useTAI } from 'renderer/hooks';
import { sprintf } from 'sprintf-js';
import { AltAzToHADec, degToDMS, getLMST, getMJD } from 'utils';
import { Deg, TCCTable } from '.';

function formatTAI(TAI: Date): string {
  let TAIstr = sprintf(
    '%04d-%02d-%02d %02d:%02d:%02d',
    TAI.getUTCFullYear(),
    TAI.getUTCMonth() + 1,
    TAI.getUTCDate(),
    TAI.getUTCHours(),
    TAI.getUTCMinutes(),
    TAI.getUTCSeconds()
  );

  return TAIstr;
}

const MiscTable: React.FC<TableProps> = (props) => {
  const TAI = useTAI();
  const [SJD, setSJD] = React.useState(0);
  const [LMST, setLMST] = React.useState(0);
  const [HA, setHA] = React.useState<{ [key: string]: number | null }>({
    HA: null,
    desCurrHA: null,
    z: null,
    airmass: null
  });
  const keywords = useKeywords(
    ['platedb.pointingInfo', 'tcc.axePos', 'tcc.secFocus', 'tcc.scaleFac'],
    'tcc-misc-keywords'
  );

  const getScaleFactor = () =>
    ((keywords['tcc.scaleFac']?.values[0] - 1) * 1e6)?.toFixed(1);

  React.useEffect(() => {
    let interval = setInterval(() => {
      setSJD(getMJD(true));
      setLMST(getLMST());
    }, 1000);
    return () => clearInterval(interval);
  }, [SJD, LMST]);

  React.useEffect(() => {
    const [az, alt] = keywords['tcc.axePos']?.values.slice(0, 2) || [0, 0];
    let HA = AltAzToHADec(alt, az)[0];
    let DesignHA = keywords['platedb.pointingInfo']?.values[5];
    let desCurrHA = DesignHA !== undefined ? HA - DesignHA : null;
    let z = alt ? 90 - alt : -999;
    setHA({
      HA: HA,
      desCurrHA: desCurrHA,
      z: z,
      airmass: alt ? 1 / Math.cos((z * Math.PI) / 180) : -999
    });
  }, [keywords]);

  return (
    <TableContainer style={{ overflow: 'hidden', verticalAlign: 'top' }}>
      <TCCTable {...props}>
        <TableHead>
          <TableRow>
            <TableCell width='90px' />
            <TableCell width='110px' />
            <TableCell width='10px' />
            {/*  */}
            <TableCell width='120px' />
            <TableCell width='70px' />
            <TableCell width='50px' />
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align='right'>HA</TableCell>
            <TableCell align='right'>
              {degToDMS(HA.HA, { precision: 0, hours: true })}
            </TableCell>
            <TableCell align='left'>hms</TableCell>
            {/*  */}
            <TableCell align='right'>Airmass</TableCell>
            <TableCell align='right'>{HA.airmass?.toFixed(3)}</TableCell>
            <TableCell align='left'></TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Design HA</TableCell>
            <TableCell align='right'>
              {degToDMS(keywords['platedb.pointingInfo']?.values[5], {
                precision: 0,
                hours: true
              })}
            </TableCell>
            <TableCell align='left'>hms</TableCell>
            {/*  */}
            <TableCell align='right'>ZD</TableCell>
            <TableCell align='right'>{HA.z?.toFixed(1)}</TableCell>
            <TableCell align='left'>
              <Deg />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Curr-Des HA</TableCell>
            <TableCell align='right'>
              {degToDMS(HA.desCurrHA, { precision: 0, hours: true })}
            </TableCell>
            <TableCell align='left'>hms</TableCell>
            {/*  */}
            <TableCell align='right'>LMST</TableCell>
            <TableCell align='right'>
              {degToDMS(LMST, { precision: 0 })}
            </TableCell>
            <TableCell align='left'>hms</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>TAI</TableCell>
            <TableCell align='right' colSpan={2}>
              {formatTAI(TAI)}
            </TableCell>
            {/*  */}
            <TableCell align='right'>SJD</TableCell>
            <TableCell align='right'>{SJD}</TableCell>
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell align='right'>Focus</TableCell>
            <TableCell align='right'>
              {Math.round(keywords['tcc.secFocus']?.values[0]) || null}
            </TableCell>
            <TableCell align='left'>{'\u03bcm'}</TableCell>
            {/*  */}
            <TableCell align='right'>Scale</TableCell>
            <TableCell align='right'>{getScaleFactor()}</TableCell>
            <TableCell align='left'>1e6</TableCell>
          </TableRow>
        </TableBody>
      </TCCTable>
    </TableContainer>
  );
};

export default MiscTable;
