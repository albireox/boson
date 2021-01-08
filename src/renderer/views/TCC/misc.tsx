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
} from '@material-ui/core';
import React from 'react';
import { useKeywords, useTAI } from 'renderer/hooks';
import { sprintf } from 'sprintf-js';
import { AltAzToHADec, degToDMS, getLMST, getMJD } from 'utils';
import { TCCTable } from '.';

function formatTAI(tai: Date): string {
  let taiStr = sprintf(
    '%04d-%02d-%02d %02d:%02d:%02d',
    tai.getUTCFullYear(),
    tai.getUTCMonth() + 1,
    tai.getUTCDate(),
    tai.getUTCHours(),
    tai.getUTCMinutes(),
    tai.getUTCSeconds()
  );

  return taiStr;
}

const MiscTable: React.FC<TableProps> = (props) => {
  const tai = useTAI();
  const [SJD, setSJD] = React.useState(0);
  const [LMST, setLMST] = React.useState(0);
  const [HA, setHA] = React.useState<{ [key: string]: number | null }>({
    HA: null,
    desCurrHA: null,
    z: null,
    airmass: null
  });

  const keywords = useKeywords(
    ['platedb.pointinginfo', 'tcc.axepos', 'tcc.secfocus', 'tcc.scalefac'],
    'tcc-misc-keywords'
  );

  const getScaleFactor = () =>
    ((keywords['tcc.scalefac']?.values[0] - 1) * 1e6)?.toFixed(1);

  React.useEffect(() => {
    let interval = setInterval(() => {
      setSJD(getMJD(true));
      setLMST(getLMST());
    }, 1000);
    return () => clearInterval(interval);
  }, [SJD, LMST]);

  React.useEffect(() => {
    const [az, alt] = keywords['tcc.axepos']?.values.slice(0, 2) || [0, 0];
    let HA = AltAzToHADec(alt, az)[0];
    let DesignHA = keywords['platedb.pointinginfo']?.values[5];
    let desCurrHA = DesignHA !== undefined ? HA - DesignHA : null;
    let z = 90 - alt;
    setHA({
      HA: HA,
      desCurrHA: desCurrHA,
      z: z,
      airmass: 1 / Math.cos((z * Math.PI) / 180)
    });
  }, [keywords]);

  return (
    <TableContainer style={{ overflow: 'hidden', verticalAlign: 'top' }}>
      <TCCTable {...props}>
        <TableHead>
          <TableRow>
            <TableCell width='90px' />
            <TableCell width='100px' />
            <TableCell width='10px' />
            {/*  */}
            <TableCell width='150px' />
            <TableCell width='80px' />
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
              {degToDMS(keywords['platedb.pointinginfo']?.values[5], {
                precision: 0,
                hours: true
              })}
            </TableCell>
            <TableCell align='left'>hms</TableCell>
            {/*  */}
            <TableCell align='right'>ZD</TableCell>
            <TableCell align='right'>{HA.z?.toFixed(1)}</TableCell>
            <TableCell align='left'>
              <span
                style={{
                  fontSize: '16px',
                  padding: '4px 0px 0px 0px',
                  lineHeight: 0,
                  display: 'block'
                }}
              >
                {'\u00b0'}
              </span>
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
              {formatTAI(tai)}
            </TableCell>
            {/*  */}
            <TableCell align='right'>SJD</TableCell>
            <TableCell align='right'>{SJD}</TableCell>
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell align='right'>Focus</TableCell>
            <TableCell align='right'>
              {Math.round(keywords['tcc.secfocus']?.values[0]) || null}
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
