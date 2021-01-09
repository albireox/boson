/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-08
 *  @Filename: axisStatus.tsx
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
import { Keyword } from 'main/tron';
import { AlertChip, Severity } from 'renderer/components/chip';
import { useKeywords } from 'renderer/hooks';
import { TCCTable } from '.';

let AxisCmdStateSeverity = new Map<string, Severity>([
  ['Drifting', Severity.Warning],
  ['Halted', Severity.Error],
  ['Halting', Severity.Error],
  ['Slewing', Severity.Warning],
  ['Tracking', Severity.Info],
  ['NotAvailable', Severity.Info]
]);

// Here the order matters. The first error/warning found will be the one
// shown, even if there are several.
// TODO: On the screen we can show only one, but the tooltip could include
// all the errors.
let ErrorBits: [number, [string, Severity]][] = [
  [6, ['Reverse limit switch', Severity.Error]],
  [7, ['Forward limit switch', Severity.Error]],
  [13, ['Stop button', Severity.Error]],
  [2, ['Reverse software limit', Severity.Error]],
  [3, ['Forward software limit', Severity.Error]],
  [11, ['Out of closed loop', Severity.Error]],
  [12, ['Amplifier disabled', Severity.Error]],
  [24, ['Fiducial error too large', Severity.Error]],
  [18, ['Clock not set', Severity.Error]],
  [16, ['1 Hz clock signal lost', Severity.Error]],
  [0, ['Motor control buffer empty', Severity.Warning]],
  [1, ['Position update late', Severity.Warning]],
  [14, ['Semaphore owned by somebody else', Severity.Warning]],
  [29, ['Windscreen touch down or cw', Severity.Warning]],
  [30, ['Windscreen touch up or ccw', Severity.Warning]],
  [4, ['Velocity limited', Severity.Warning]],
  [5, ['Acceleration limited', Severity.Warning]]
];

const SmallAlertChip: React.FC<any> = (props) => {
  let updatedProps = { ...props };
  if (props.hidden) {
    if (props.style) {
      updatedProps.style['visibility'] = 'hidden';
    } else {
      updatedProps['style'] = { visibility: 'hidden' };
    }
    delete updatedProps.hidden;
  }
  return <AlertChip variant='outlined' size='small' {...updatedProps} />;
};

const AxisStatus: React.FC<TableProps> = (props) => {
  const keywords = useKeywords(
    [
      'tcc.axePos',
      'tcc.tccPos',
      'tcc.axisCmdState',
      'tcc.axisErrCode',
      'tcc.altStat',
      'tcc.azStat',
      'tcc.rotStat'
    ],
    'tcc-axis-keywords'
  );

  const getAxisPos = (key: string, idx: number) => {
    if (!keywords[key]) {
      return null;
    }
    if (keywords[key].values[idx] === 'nan') {
      return 'NaN';
    } else {
      return (keywords[key].values[idx] as number).toFixed(1) + ' \u00b0';
    }
  };

  const getAxisCmdState = (
    axisCmdState: Keyword | undefined,
    axis: number
  ): { label: string; severity: Severity } => {
    if (!axisCmdState) return { label: 'N/A', severity: Severity.Error };
    let value = axisCmdState.values[axis];
    return {
      label: value,
      severity: AxisCmdStateSeverity.get(value) as Severity
    };
  };

  const getAxisErrCode = (
    axisErrCode: Keyword | undefined,
    axis: number
  ): { label: string; severity: Severity } => {
    if (!axisErrCode) return { label: 'N/A', severity: Severity.Error };
    let value = axisErrCode.values[axis];
    return {
      label: value,
      severity: value === 'OK' ? Severity.Success : Severity.Error
    };
  };

  const getAxisStat = (
    axisErrBits: Keyword | undefined
  ): { label: string; severity: Severity; hidden?: boolean } => {
    if (!axisErrBits) return { label: 'N/A', severity: Severity.Error };
    let code = parseInt(axisErrBits.values[3]);
    let bits: number[] = [];
    for (let bit = 0; bit < 32; bit++) {
      if (Math.pow(2, bit) & code) bits.push(bit);
    }
    for (let bitInfo of ErrorBits) {
      for (let bit of bits) {
        if (bit === bitInfo[0])
          return { label: bitInfo[1][0], severity: bitInfo[1][1] };
      }
    }
    return { hidden: true, label: 'OK', severity: Severity.Info };
  };

  return (
    <TableContainer style={{ overflow: 'hidden', verticalAlign: 'top' }}>
      <TCCTable {...props}>
        <TableHead>
          <TableRow>
            <TableCell width='30px' />
            <TableCell width='55px' />
            <TableCell width='55px' />
            <TableCell width='80px' />
            <TableCell width='100px' />
            <TableCell width='160px' />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align='right'>Az</TableCell>
            <TableCell align='right'>{getAxisPos('tcc.axePos', 0)}</TableCell>
            <TableCell align='right'>{getAxisPos('tcc.tccPos', 0)}</TableCell>
            <TableCell align='right'>
              <SmallAlertChip
                {...getAxisCmdState(keywords['tcc.axisCmdState'], 0)}
              />
            </TableCell>
            <TableCell align='left' style={{ paddingLeft: '4px' }}>
              <SmallAlertChip
                {...getAxisErrCode(keywords['tcc.axisErrCode'], 0)}
              />
            </TableCell>
            <TableCell align='left'>
              <SmallAlertChip
                style={{ maxWidth: '150px' }}
                {...getAxisStat(keywords['tcc.azStat'])}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Alt</TableCell>
            <TableCell align='right'>{getAxisPos('tcc.axePos', 1)}</TableCell>
            <TableCell align='right'>{getAxisPos('tcc.tccPos', 1)}</TableCell>
            <TableCell align='right'>
              <SmallAlertChip
                {...getAxisCmdState(keywords['tcc.axisCmdState'], 1)}
              />
            </TableCell>
            <TableCell align='left' style={{ paddingLeft: '4px' }}>
              <SmallAlertChip
                {...getAxisErrCode(keywords['tcc.axisErrCode'], 1)}
              />
            </TableCell>
            <TableCell align='left'>
              <SmallAlertChip
                style={{ maxWidth: '150px' }}
                {...getAxisStat(keywords['tcc.altStat'])}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Rot</TableCell>
            <TableCell align='right'>{getAxisPos('tcc.axePos', 2)}</TableCell>
            <TableCell align='right'>{getAxisPos('tcc.tccPos', 2)}</TableCell>
            <TableCell align='right'>
              <SmallAlertChip
                {...getAxisCmdState(keywords['tcc.axisCmdState'], 2)}
              />
            </TableCell>
            <TableCell align='left' style={{ paddingLeft: '4px' }}>
              <SmallAlertChip
                {...getAxisErrCode(keywords['tcc.axisErrCode'], 2)}
              />
            </TableCell>
            <TableCell align='left'>
              <SmallAlertChip
                style={{ maxWidth: '150px' }}
                {...getAxisStat(keywords['tcc.rotStat'])}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </TCCTable>
    </TableContainer>
  );
};

export default AxisStatus;
