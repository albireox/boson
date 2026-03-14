/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: AxisOffsetStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { DMSConvert } from './HMSConvert';

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
            <Grid size={2}>
                 Calib Off
            </Grid>
            <Grid size={1}>
                Az
            </Grid>
            <Grid size={3}>
                {calibAz}°'"
            </Grid>
            <Grid size={1}>
                 Guide Off
            </Grid>
            <Grid size={1}>
                Az
            </Grid>
            <Grid size={3}>
                {guideAz}°'"
            </Grid>

            <Grid size={2}/>
            <Grid size={1}>
                Alt
            </Grid>
            <Grid size={3}>
                {calibAlt}°'"
            </Grid>
            <Grid size={1}/>
            <Grid size={1}>
                Alt
            </Grid>
            <Grid size={3}>
                {guideAlt}°'"
            </Grid>

            <Grid size={2}/>
            <Grid size={1}>
                Rot
            </Grid>
            <Grid size={3}>
                {calibRot}°'"
            </Grid>
            <Grid size={1}/>
            <Grid size={1}>
                Rot
            </Grid>
            <Grid size={3}>
                {guideRot}°'"
            </Grid>
            
        </Grid>
        </Box>
    )
}