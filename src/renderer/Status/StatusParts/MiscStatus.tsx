import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Box } from '@mui/system';
import React from 'react';
import { useStore } from 'renderer/hooks';
import { useKeywords } from 'renderer/hooks';
import { unixSecondstoSJD, getLMST, UnixS, unixSecondsToTAI } from './timeFuncs';
import { HAfromAzAlt } from './HAfromAzAlt';
import { Latitude } from './TelConst';
import { HMSConvert, HMSConvertNoDecimal } from './HMSConvert';
import { Airmass } from './Airmass';
import Cartridge  from './Cartridge';


export default function MiscStatus() {
    const keywords = useKeywords([
            'tcc.AxePos',
            'tcc.TAI', 
            'tcc.TimeStamp', //updates every minute
            'tcc.ScaleFac', //scale
            'tcc.SecFocus', //focus
            'mcp.instrumentNum'
        ])

    const [hour_angle, setHA] = React.useState<string>('');
    const [airmass, setAirmass] = React.useState<string>('');
    const [tai, setTAI] = React.useState<string>(''); //doesn't update?
    const [scale, setScale] = React.useState<string>(''); //not sure
    const [focus, setFocus] = React.useState<string>(''); //not sure, ask
    const [sjd, setSJD] = React.useState<number>(); 
    const [lmst, setLMST] = React.useState<string>(''); 
    const [cartridge, setCartridge] = React.useState<string>('');

    const{
        AxePos: axePosw, 
        ScaleFac: scaleW,
        SecFocus: focusW,
        TimeStamp: timeStampW,
        instrumentNum: instNumW,
    } = keywords;

    React.useEffect(() => {
        //console.log(`instrument:`,instNumW); 
               
        setAirmass(Airmass(axePosw ? axePosw.values[1] : 0).toFixed(3)); //alt is 2nd value in AxePos
        
        setScale(scaleW ? ((scaleW.values[0] - 1) * 1.0e6).toFixed(1) : 'N/A');
        setFocus(focusW ? focusW.values[0] : 'N/A');
        
        setHA(axePosw ? HMSConvert(HAfromAzAlt(axePosw.values[0], axePosw.values[1],Latitude)) : 'N/A'); //need to get lat of LCO
        setCartridge(Cartridge(instNumW ? instNumW.values[0] : null));
    }, [keywords]);

    //grab the obs, default to APO
    const [observatory] = useStore<string>('connection.observatory');

    React.useEffect(() => {
        
        var long = -105.820278;
        if (observatory == 'LCO') {
            long = -70.69208;
        } 

        const tick = () => {
            setTAI(unixSecondsToTAI(UnixS()));
            setSJD(unixSecondstoSJD(UnixS())); //adding .3
            setLMST(HMSConvertNoDecimal(getLMST(UnixS(), long))); //longitude of APO
        };
        tick();
        const interval = setInterval(tick, 1000); // Update every second
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    //not sure how to calc LMST, no long in tcc

    return (
        
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={1}>
        <Grid container columnSpacing={10} rowSpacing={1} columns={2}>
            <Grid xs={1}>
                HA : {hour_angle} {'   '} hms
            </Grid>
            <Grid xs={1}>
                Airmass : {airmass}
            </Grid>
            <Grid xs={1}>
                ZD {'    '} : {(90-Number(axePosw ? axePosw.values[1] : 0)).toFixed(1)}° 
            </Grid>
            <Grid xs={1}>
                LMST: {lmst} hms
            </Grid>
            <Grid xs={1}>
                TAI : {tai}
            </Grid>
            <Grid xs={1}>
                SJD : {sjd} days
            </Grid>
            <Grid xs={1}>
                Focus: {focus} μm
            </Grid>
            <Grid xs={1}>
                Scale: {scale} 1e6
            </Grid>
            <Grid xs={1}>
                Cartridge: {cartridge}
            </Grid>
        </Grid>
        </Box>
    )

    }