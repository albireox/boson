/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-29
 *  @Filename: ExposeRow.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack } from '@mui/system';
import { Chip } from '@mui/material';
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
  const [gfaAng, setGfaAng] = React.useState<string>('0');
  const [expTime, setExpTime] = React.useState<string>('10');

  const [isSlewing, setIsSlewing] = React.useState(false);
  const [isExposing, setIsExposing] = React.useState(false);

  const { AxisCmdState: axisCmdState } = useKeywordContext();
  const { TCCPos: tccPos } = useKeywordContext();

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


  async function asyncClick() {
    setIsExposing(true);
    console.log(`tcc pos ${tccPos.values[2]}`);
    console.log("button clickededed!!");
    await window.electron.tron.send(`tcc offset rotator ${gfaAng} /computed`);
    await window.electron.tron.send(`tcc offset inst 0, 1.47 /pabsolute/computed`);
    await window.electron.tron.send(`fliswarm talk -n gfa2 expose ${expTime}`);
    await window.electron.tron.send(`tcc offset inst 0, -1.47 /pabsolute/computed`);
    await window.electron.tron.send(`fliswarm talk -n gfa5 expose ${expTime}`);
    await window.electron.tron.send(`tcc offset inst 0, 0 /pabsolute/computed`);
    console.log("button done!!");
    setIsExposing(false);
  }

  return (
    <Stack direction="column" spacing={1}>
    <Stack direction='row' spacing={4}>
      <SearchBox
        endAdornment={<span>AZ deg</span>}
        defaultWidth={100}
        placeholder='AZ'
        value={az}
        onChange={(event) => setAz(event.target.value)}
      />
      <SearchBox
        endAdornment={<span>Alt deg</span>}
        defaultWidth={100}
        placeholder='Alt'
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
      />
      <SearchBox
        endAdornment={<span>min mag</span>}
        defaultWidth={100}
        placeholder='min'
        value={minMag}
        onChange={(event) => setMinMag(event.target.value)}
      />
      <SearchBox
        endAdornment={<span>max mag</span>}
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
      <SearchBox
        endAdornment={<span>GFA rot (deg)</span>}
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
      <CommandButton variant='contained' onClick={asyncClick} disabled={isExposing} endIcon={<InsightsIcon />}>
        Expose Two
      </CommandButton>
    </Stack>
    </Stack>

  );
}
