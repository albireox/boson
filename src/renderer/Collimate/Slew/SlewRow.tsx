/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-29
 *  @Filename: ExposeRow.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack } from '@mui/system';
import { Chip, Select, SelectChangeEvent, MenuItem } from '@mui/material';
import { useKeywordContext } from 'renderer/hooks';
import React from 'react';
import { DataGridPro, GridColDef, LicenseInfo } from '@mui/x-data-grid-pro';
import { CommandButton, SearchBox } from 'renderer/Components';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import InsightsIcon from '@mui/icons-material/Insights';

export default function SlewRow() {

  const [alt, setAlt] = React.useState<string>('70');
  const [az, setAz] = React.useState<string>('180');
  const [minMag, setMinMag] = React.useState<string>('7');
  const [maxMag, setMaxMag] = React.useState<string>('11');
  const [gfaAng, setGfaAng] = React.useState<number>(0);
  const [expTime, setExpTime] = React.useState<string>('10');
  const [mirTrans, setMirTrans] = React.useState<number>(30);
  const [activeMirror, setActiveMirror] = React.useState<string>("M1");

  const [isSlewing, setIsSlewing] = React.useState(false);
  const [isExposing, setIsExposing] = React.useState(false);
  const [isRotating, setIsRotating] = React.useState(false);

  const { AxisCmdState: axisCmdState } = useKeywordContext();
  const { TCCPos: tccPos } = useKeywordContext();
  const { AxePos: axePos } = useKeywordContext();

  React.useEffect(() => {
      if (!axisCmdState) return;

      const azState: string = axisCmdState.values[0];
      const altState: string = axisCmdState.values[1];
      const rotState: string = axisCmdState.values[2];

      if (azState === "Slewing"){
        setIsSlewing(true);
      }
      else if (altState == "Slewing"){
        setIsSlewing(true);
      }
      else if (rotState == "Slewing"){
        setIsSlewing(true);
      }
      else {
        setIsSlewing(false);
      }

    }, [axisCmdState]);

  const mirrorSelect = (
    event: SelectChangeEvent
  ) => {
    setActiveMirror(event.target.value);
  }

  const computeDeltaRot = () => {
    const rotPos: number = axePos.values[2];
    const currGfaAng: number = rotPos + 90;
    let deltaRot: number = gfaAng - currGfaAng;
    // min max rot angle for 25m are: -180 to 360
    if (rotPos + deltaRot < -160){
      deltaRot = deltaRot + 360;
    }
    else if (rotPos + deltaRot > 340){
      deltaRot = deltaRot - 360;
    }
    return deltaRot;
  }

  async function exposeTwo() {
    setIsExposing(true);
    let deltaRot = computeDeltaRot();

    console.log(`deltarot ${deltaRot}`);
    console.log("button clickededed!!");
    // await window.electron.tron.send(`tcc offset rotator ${gfaAng} /computed`);
    // await window.electron.tron.send(`tcc offset inst 0, 1.47 /pabsolute/computed`);
    // await window.electron.tron.send(`fliswarm talk -n gfa2 expose ${expTime}`);
    // await window.electron.tron.send(`tcc offset inst 0, -1.47 /pabsolute/computed`);
    // await window.electron.tron.send(`fliswarm talk -n gfa5 expose ${expTime}`);
    // await window.electron.tron.send(`tcc offset inst 0, 0 /pabsolute/computed`);
    console.log("button done!!");
    setIsExposing(false);
  }

  async function rotateMirror() {
    if (mirTrans===0) return;
    setIsRotating(true);
    let mir: string = "prim";
    let tiltFactor: number = 0.04393;
    if (activeMirror == "M1"){
      mir = "prim";
      tiltFactor = 0.04393;
    }
    else {
      mir = "sec";
      tiltFactor = 0.19116;
    }

    const xtrans: number = Math.round(mirTrans * Math.cos(gfaAng * Math.PI / 180.0) * 100.0)/100.0;
    const ytrans: number = Math.round(mirTrans * Math.sin(gfaAng * Math.PI / 180.0) * 100.0)/100.0;
    const xtilt: number = Math.round(-1.0 * ytrans * tiltFactor * 100.0)/100.0; // x tilt opposite sign as ytrans
    const ytilt: number = Math.round(xtrans * tiltFactor * 100.0)/100.0; // y tilt same sign as x

    const xTransCmd: string = `tcc talk sec "offset 0.0, 0.0, ${ytilt}, ${xtrans}, 0.0"`;
    const yTransCmd: string = `tcc talk sec "offset 0.0, ${xtilt}, 0.0, 0.0, ${ytrans}"`;
    // console.log(`xytrans ${xtrans} ${ytrans} ${xtilt} ${ytilt}`);
    if (mirTrans < 0){
      // command x then y translation
      console.log("mirror trans < 0");
      if (Math.abs(xtrans) > 0){
        console.log(xTransCmd);
      }
      if (Math.abs(ytrans) > 0){
        console.log(yTransCmd);
      }
    }
    else {
      // command y then x translation
      if (Math.abs(ytrans) > 0){
        console.log(yTransCmd);
      }
      if (Math.abs(xtrans) > 0){
        console.log(xTransCmd);
      }
    }


    // console.log(`tcc pos ${tccPos.values[2]}`);
    // console.log("button clickededed!!");
    // await window.electron.tron.send(`tcc offset rotator ${gfaAng} /computed`);
    // await window.electron.tron.send(`tcc offset inst 0, 1.47 /pabsolute/computed`);
    // await window.electron.tron.send(`fliswarm talk -n gfa2 expose ${expTime}`);
    // await window.electron.tron.send(`tcc offset inst 0, -1.47 /pabsolute/computed`);
    // await window.electron.tron.send(`fliswarm talk -n gfa5 expose ${expTime}`);
    // await window.electron.tron.send(`tcc offset inst 0, 0 /pabsolute/computed`);
    // console.log("button done!!");
    setIsRotating(false);
  }

  return (
    <Stack direction="column" spacing={1}>
    <Stack direction='row' spacing={2}>
      <SearchBox
        endAdornment={<span>AZ (deg)</span>}
        defaultWidth={100}
        placeholder='AZ'
        value={az}
        onChange={(event) => setAz(event.target.value)}
      />
      <SearchBox
        endAdornment={<span>Alt (deg)</span>}
        defaultWidth={100}
        placeholder='Alt'
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
      />
      <SearchBox
        endAdornment={<span>min (mag)</span>}
        defaultWidth={100}
        placeholder='min'
        value={minMag}
        onChange={(event) => setMinMag(event.target.value)}
      />
      <SearchBox
        endAdornment={<span>max (mag)</span>}
        defaultWidth={100}
        placeholder='max'
        value={maxMag}
        onChange={(event) => setMaxMag(event.target.value)}
      />
      <CommandWrapper
        commandString={`tcc track ${az}, ${alt} obs/pterr/rottype=object/rotang=0/magRange=(${minMag}, ${maxMag}) `} //${expTime}`}
        isRunning={isSlewing}
        // abortCommand='cherno stop'
        // runningTooltip='Stop guiding'
      >
        <CommandButton variant='contained' endIcon={<InsightsIcon />}>
          Slew
        </CommandButton>
      </CommandWrapper>
      </Stack>
      <Stack direction="row" spacing={2}>
      <SearchBox
        endAdornment={<span>GFA2 ang (deg)</span>}
        defaultWidth={100}
        placeholder='gfaAng'
        value={gfaAng}
        onChange={(event) => setGfaAng(event.target.value)}
      />
      <SearchBox
        endAdornment={<span>Exptime (s)</span>}
        defaultWidth={100}
        placeholder='expTime'
        value={expTime}
        onChange={(event) => setExpTime(event.target.value)}
      />
      <CommandButton variant='contained' onClick={exposeTwo} disabled={isExposing} endIcon={<InsightsIcon />}>
        Rotate and Expose Two
      </CommandButton>
    </Stack>
    <Stack direction="row" spacing={2}>
      <Select defaultValue="M1" onChange={mirrorSelect}>
        <MenuItem value="M1">M1</MenuItem>
        <MenuItem value="M2">M2</MenuItem>
      </Select>
      <SearchBox
        endAdornment={<span>trans (um)</span>}
        defaultWidth={100}
        placeholder='mirTrans'
        value={mirTrans}
        onChange={(event) => setMirTrans(event.target.value)}
      />
      <CommandButton variant='contained' onClick={rotateMirror} disabled={isRotating} endIcon={<InsightsIcon />}>
        Coma-free offset in {gfaAng} deg direction
      </CommandButton>
    </Stack>
    </Stack>

  );
}
