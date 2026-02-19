import Grid from '@mui/material/Unstable_Grid2';
import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { DMSConvert } from './HMSConvert';

export default function OffsetStatus() {
    const keywords = useKeywords([
            'tcc.ObjArcOff', //az, alt
            'tcc.Boresight', //x, y but in actorkeys as az, alt
            //not sure about the x, y part of this window
            'jaeger.configuration_loaded'
        ])

    const [azOff, setAzOff] = React.useState<string>('');
    const [altOff, setAltOff] = React.useState<string>('');
    const [borex, setBorex] = React.useState<string>('');
    const [borey, setBorey] = React.useState<string>('');

    const { 
        ObjArcOff: objArcOffw,
        Boresight: boresightw //has 6 values in the array?
    } = keywords;

    React.useEffect(() => {
        console.log(boresightw);
        if (!objArcOffw) {
            setAzOff('N/A');
            setAltOff('N/A');
            return;
        }
        setAzOff(DMSConvert(objArcOffw.values[0]));
        setAltOff(DMSConvert(objArcOffw.values[1]));
        setBorex(boresightw ? DMSConvert(boresightw.values[0]) : 'N/A');
        setBorey(boresightw ? DMSConvert(boresightw.values[1]) : 'N/A');
        
        
    }, [keywords]);

    return (
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={1}>
        <Grid container columnSpacing={10} rowSpacing={1} columns={12}>
            <Grid xs={2}>
                Object
            </Grid>
            <Grid xs={1}>
                Az
            </Grid>
            <Grid xs={3}>
                {azOff}°'"
            </Grid>
            <Grid xs={1}>
                Bore         
            </Grid>
            <Grid xs={1}>
                X  
            </Grid>
            <Grid xs={3}>
                {borex}°'"
            </Grid>


            <Grid xs={2}>
                Arc Off
            </Grid>
            <Grid xs={1}>
                Alt
            </Grid>
            <Grid xs={3}>
                {altOff}°'"
            </Grid>
            <Grid xs={1} />
            <Grid xs={1}>
                Y         
            </Grid>
            <Grid xs={3}>
                {borey}°'"
            </Grid>
        </Grid>
        </Box>
    )
}