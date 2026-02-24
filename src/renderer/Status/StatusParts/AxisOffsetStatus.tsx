import Grid from '@mui/material/Unstable_Grid2';
import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { DMSConvert } from './HMSConvert';
import { parseBitErrors } from './bitErr';

export default function AxisOffset() {
    const keywords = useKeywords([
        'tcc.CalibOff', //az, alt, rot
        'tcc.GuideOff', //az, alt, rot

    ])

    const [calibAz, setCalibAz] = React.useState<string>('');
    const [calibAlt, setCalibAlt] = React.useState<string>('');
    const [calibRot, setCalibRot] = React.useState<string>('');
    const [guideAz, setGuideAz] = React.useState<string>('');
    const [guideAlt, setGuideAlt] = React.useState<string>('');
    const [guideRot, setGuideRot] = React.useState<string>('');
    

    const { 
        CalibOff: calibOffw,
        GuideOff: guideOffw,
        

    } = keywords;

    React.useEffect(() => {
        //console.log(`Guide offset:`,guideOffw);
        setCalibAz(calibOffw ? DMSConvert(calibOffw.values[0]) : 'N/A');
        setCalibAlt(calibOffw ? DMSConvert(calibOffw.values[3]) : 'N/A');
        setCalibRot(calibOffw ? DMSConvert(calibOffw.values[6]) : 'N/A');
        setGuideAz(guideOffw ? DMSConvert(guideOffw.values[0]) : 'N/A');
        setGuideAlt(guideOffw ? DMSConvert(guideOffw.values[3]) : 'N/A');
        setGuideRot(guideOffw ? DMSConvert(guideOffw.values[6]) : 'N/A'); 
        
    }, [keywords]);

    return (
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={1} whiteSpace={'pre'}>
        <Grid container columnSpacing={10} rowSpacing={1} columns={12}>
            <Grid xs={2}>
                 Calib Off
            </Grid>
            <Grid xs={1}>
                Az
            </Grid>
            <Grid xs={3}>
                {calibAz}°'"
            </Grid>
            <Grid xs={1}>
                 Guide Off
            </Grid>
            <Grid xs={1}>
                Az
            </Grid>
            <Grid xs={3}>
                {guideAz}°'"
            </Grid>

            <Grid xs={2}/>
            <Grid xs={1}>
                Alt
            </Grid>
            <Grid xs={3}>
                {calibAlt}°'"
            </Grid>
            <Grid xs={1}/>
            <Grid xs={1}>
                Alt
            </Grid>
            <Grid xs={3}>
                {guideAlt}°'"
            </Grid>

            <Grid xs={2}/>
            <Grid xs={1}>
                Rot
            </Grid>
            <Grid xs={3}>
                {calibRot}°'"
            </Grid>
            <Grid xs={1}/>
            <Grid xs={1}>
                Rot
            </Grid>
            <Grid xs={3}>
                {guideRot}°'"
            </Grid>
            
        </Grid>
        </Box>
    )
}