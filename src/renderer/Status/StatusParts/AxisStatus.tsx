import Grid from '@mui/material/Unstable_Grid2';
import { Box } from '@mui/system';
import { DMSConvert } from './HMSConvert';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { parseBitErrors } from './bitErr';

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
            <Grid xs={3}>
                Az : {az} {"   "}°
            </Grid>
            <Grid xs={2}>
                {azTarget}{"   "}° 
            </Grid>
            <Grid xs={2}>
                {azCmdState}
            </Grid>
            <Grid xs={3}>
                {azErrCode}
            </Grid>
            <Grid xs={10}>{azStat}</Grid>
            <Grid xs={3}>
                Alt : {alt} {"   "}°           
            </Grid>
            <Grid xs={2}>
                {altTarget}{"   "}° 
            </Grid>
            <Grid xs={2}>
                {altCmdState}
            </Grid>
            <Grid xs={3}>
                {altErrCode}
            </Grid>
            <Grid xs={10}>{altStat}</Grid>

            <Grid xs={3}>
                Rot : {rot} {"   "}°            
            </Grid>
            <Grid xs={2}>
                {rotTarget}{"   "}° 
            </Grid>
            <Grid xs={2}>
                {rotCmdState}
            </Grid>
            <Grid xs={3}>
                {rotErrCode}
            </Grid>
            <Grid xs={10}>{rotStat}</Grid>


        </Grid>
        </Box>
    )
}