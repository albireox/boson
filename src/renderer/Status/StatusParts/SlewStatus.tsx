/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: SlewStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import { Box } from '@mui/system';
import { LinearProgress } from '@mui/material';
import React from 'react';
import { useKeywords } from 'renderer/hooks';

export default function SlewStatus() {

    const keywords = useKeywords([
        'tcc.SlewDuration',
        'tcc.SlewEnd',
        'tcc.SlewSuperseded',
        'tcc.AxisCmdState',
        'tcc.SlewBeg'
    ])

    const [slewProgress, setSlewProgress] = React.useState<number>(0);
    const [remainingSec, setRemainingSec] = React.useState<number>(0);
  

    const{
        SlewDuration: slewDurationW,
        SlewEnd: slewEndW,
        SlewSuperseded: slewSupersededW,
        AxisCmdState: axisCmdStateW,
        SlewBeg : slewBegW
    } = keywords;

    const slewDuration = React.useMemo(() => {
        const v = slewDurationW?.values?.[0];
        return Number.isFinite(v) ? v : 0;
    }, [slewDurationW]);

    const slewBeg = React.useMemo(() => {
        const v = slewBegW?.values?.[0];
        return Number.isFinite(v) ? v : NaN;
    }, [slewBegW]);

    const slewSuperseded = React.useMemo(() => {
        const v = slewSupersededW?.values?.[0];
        return Boolean(v);
    }, [slewSupersededW]);

    const isSlewing = React.useMemo(() => {
        const vals = axisCmdStateW?.values;
        if (!Array.isArray(vals)) return false;
        return vals.some((x => String(x).includes("Slewing")));
    }, [axisCmdStateW]);

    const nowTAIMJDSec = React.useCallback(() => {
        return Date.now() / 1000 + 3506716800 + 37; // current time in seconds, converted to TAI MJD seconds
    }, []);

    const localStartRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (!isSlewing) {
          setSlewProgress(0);
          setRemainingSec(0);
          localStartRef.current = null;
        }
      }, [isSlewing]);

    React.useEffect(() => {   
        if (!isSlewing || slewSuperseded || !(slewDuration > 0) || !Number.isFinite(slewDuration)) {
            setSlewProgress(0);
            setRemainingSec(Math.floor(slewDuration));
            localStartRef.current = null;
            return;
        }


        const tick = () => {
            if (localStartRef.current === null) {
                localStartRef.current = nowTAIMJDSec();
                setSlewProgress(0);
                setRemainingSec(Math.floor(slewDuration));
                return;
            }

            
            const elapsed = Math.max(0,nowTAIMJDSec()-localStartRef.current); // not sure why but sometimes slewBeg is slightly in the future, so take absolute value to avoid negative progress
            const remaining = Math.max(0, slewDuration - elapsed);
            const percent = Math.max(0,Math.min(100,(elapsed / slewDuration) * 100));

            setRemainingSec(Math.floor(remaining));

            if (percent >= 100) {
                setSlewProgress(0);
                setRemainingSec(0);
                localStartRef.current = null;
                return;
            }

            console.log(`Slew duration: ${slewDuration}s, Slew began at: ${localStartRef.current}s`);
            console.log(`Slew progress: ${percent.toFixed(1)}% elapsed: ${elapsed.toFixed(1)}s`);
            setSlewProgress(Math.max(0,Math.min(100,percent)));
        };

        tick(); // update immediately
        const id = window.setInterval(tick, 100); // update every 100ms
        return () => window.clearInterval(id); // cleanup on unmount or when dependencies change
        
    }, [isSlewing, slewSuperseded, slewDuration, slewBeg]);
    
    return (
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={5}>
            { isSlewing && !slewSuperseded ? (
            <>
            <p>Slew Progress - {remainingSec}s remaining</p>
            <LinearProgress variant="determinate" value={slewProgress} sx={{ width: '50%' }} />
            </>
            ) : null }
        </Box>
    );
}