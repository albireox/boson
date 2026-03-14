/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: AxisStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { parseBitErrors, parseBitColor } from './bitErr';


const statusColors: Record<number, string> = {
    0: 'black',
    1: 'blue',
    2: 'red',
};

const cmdStates : Record<string,number> = {
    //1 is warning, 2 is error, 0 is normal
    "Drifting" : 1,
    "Halted" : 2,
    "Halting" : 2,
    "Slewing" : 1,
    "Tracking" : 0,
    "NotAvailable" : 0,
}

export default function AxisStatus() {
    const keywords = useKeywords([
        'tcc.AxePos', //az, alt, rot
        'tcc.AxisCmdState', //enum, maybe switch to <axis>stat, but unsure what status uint are
        'tcc.AxisErrCode',
        'tcc.AltStat',
        'tcc.AzStat',
        'tcc.RotStat',
        'tcc.TCCPos',
    ])

    const [az, setAz] = React.useState<string>(''); //truncate later
    const [alt, setAlt] = React.useState<string>('');
    const [rot, setRot] = React.useState<string>('');
    const [azTarget, setAzTarget] = React.useState<string>('');
    const [altTarget, setAltTarget] = React.useState<string>('');
    const [rotTarget, setRotTarget] = React.useState<string>('');
    const [altCmdState, setAltCmdState] = React.useState<string>('');
    const [azCmdState, setAzCmdState] = React.useState<string>('');
    const [rotCmdState, setRotCmdState] = React.useState<string>('');
    const [azErrCode, setAxisErrCode] = React.useState<string>('');
    const [altErrCode, setAltErrCode] = React.useState<string>('');
    const [rotErrCode, setRotErrCode] = React.useState<string>('');
    const [altStat, setAltStat] = React.useState<string>('');
    const [azStat, setAzStat] = React.useState<string>('');
    const [rotStat, setRotStat] = React.useState<string>('');

    const { 
        AxePos: axePosw,
        AxisCmdState: axisCmdStatew,
        AxisErrCode: axisErrCodew,
        AltStat: altStatw,
        AzStat: azStatw,
        RotStat: rotStatw,
        TCCPos: tccPosw

     } = keywords;


    //to do, maybe make the status update more freq, plus add sound + colors
    React.useEffect(() => {
        //console.log(axisCmdStatew);
        if (!axePosw) {
            setAz('N/A');
            setAlt('N/A');
            setRot('N/A');
            return;
        }
        setAz(axePosw.values[0].toFixed(1));
        setAlt(axePosw.values[1].toFixed(1));
        setRot(axePosw.values[2].toFixed(1));

        //this is done because in some cases these values are "nan"
        const azTargetVal = tccPosw?.values?.[0];
        const altTargetVal = tccPosw?.values?.[1];
        const rotTargetVal = tccPosw?.values?.[2];

        setAzTarget(Number.isFinite(azTargetVal) ? azTargetVal.toFixed(1) : '');
        setAltTarget(Number.isFinite(altTargetVal) ? altTargetVal.toFixed(1) : '');
        setRotTarget(Number.isFinite(rotTargetVal) ? rotTargetVal.toFixed(1) : '');

        setAzCmdState(axisCmdStatew ? axisCmdStatew.values[0] : 'N/A');
        setAltCmdState(axisCmdStatew ? axisCmdStatew.values[1] : 'N/A');
        setRotCmdState(axisCmdStatew ? axisCmdStatew.values[2] : 'N/A');

        setAxisErrCode(axisErrCodew ? axisErrCodew.values[0] : 'N/A');
        setAltErrCode(axisErrCodew ? axisErrCodew.values[1] : 'N/A');
        setRotErrCode(axisErrCodew ? axisErrCodew.values[2] : 'N/A');
        
        setAltStat(altStatw ? parseBitErrors(altStatw.values[3]) : 'N/A');
        setAzStat(azStatw ? parseBitErrors(azStatw.values[3]) : 'N/A');
        setRotStat(rotStatw ? parseBitErrors(rotStatw.values[3]) : 'N/A');

        

    }, [axePosw]);

    return (
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={1}>
        <Grid container columnSpacing={4} rowSpacing={1} columns={20}>
            <Grid size={3}>
                Az : {az} {"   "}°
            </Grid>
            <Grid size={2}>
                {azTarget}{"   "}° 
            </Grid>
            <Grid size={2} sx={{color: statusColors[cmdStates[azCmdState] || 0]}}>
                {azCmdState}
            </Grid>
            <Grid size={3}>
                {azErrCode}
            </Grid>
            <Grid size={10} sx={{color: statusColors[azStatw ? parseBitColor(azStatw.values[3]) : 0]}}>{azStat}</Grid>
            <Grid size={3}>
                Alt : {alt} {"   "}°           
            </Grid>
            <Grid size={2}>
                {altTarget}{"   "}° 
            </Grid>
            <Grid size={2} sx={{color: statusColors[cmdStates[altCmdState] || 0]}}>
                {altCmdState}
            </Grid>
            <Grid size={3}>
                {altErrCode}
            </Grid>
            <Grid size={10} sx={{color: statusColors[altStatw ? parseBitColor(altStatw.values[3]) : 0]}}>{altStat}</Grid>

            <Grid size={3}>
                Rot : {rot} {"   "}°            
            </Grid>
            <Grid size={2}>
                {rotTarget}{"   "}° 
            </Grid>
            <Grid size={2} sx={{color: statusColors[cmdStates[rotCmdState] || 0]}}>
                {rotCmdState}
            </Grid>
            <Grid size={3}>
                {rotErrCode}
            </Grid>
            <Grid size={10} sx={{color: statusColors[rotStatw ? parseBitColor(rotStatw.values[3]) : 0]}}>{rotStat}</Grid>
        </Grid>
        </Box>
    )
}