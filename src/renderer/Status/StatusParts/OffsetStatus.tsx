/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: OffsetStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { DMSConvert } from './HMSConvert';
import { sysconstlist } from './SysConstList';
import { rot2D } from './MathUtil';

export default function OffsetStatus() {
    const keywords = useKeywords([
            'tcc.ObjArcOff', //az, alt
            'tcc.Boresight', //x, y but in actorkeys as az, alt
            'tcc.ObjSys',
            'tcc.ObjInstAng',
            'jaeger.configuration_loaded'
        ])

    const [offpos1, setoffpos1] = React.useState<string>('');
    const [offpos2, setoffpos2] = React.useState<string>('');
    const [borex, setBorex] = React.useState<string>('');
    const [borey, setBorey] = React.useState<string>('');
    const [objxoff, setObjxoff] = React.useState<string>('');
    const [objyoff, setObjyoff] = React.useState<string>('');

    const { 
        ObjArcOff: objArcOffw,
        Boresight: boresightw,
        ObjSys: objSysw,
        ObjInstAng: objInstAngw,
    } = keywords;

    React.useEffect(() => {
        console.log(objInstAngw);
        if (!objArcOffw) {
            setoffpos1('N/A');
            setoffpos2('N/A');
            return;
        }
        let offpos1 = DMSConvert(objArcOffw.values[0]);
        let offpos2 = DMSConvert(objArcOffw.values[3]);
        let xyVec = [objArcOffw.values[0], objArcOffw.values[3]];
        if (typeof objInstAngw.values[0] === "string" || Number.isNaN(Number(objInstAngw.values[0]))) {
            setObjxoff("??:??:??");     
            setObjyoff("??:??:??");  
        } else {
            setObjxoff(DMSConvert(rot2D(xyVec, objInstAngw ? objInstAngw.values[0] : 0).xRot));
            setObjyoff(DMSConvert(rot2D(xyVec, objInstAngw ? objInstAngw.values[0] : 0).yRot));
        }
        setoffpos1(offpos1);
        setoffpos2(offpos2);
        setBorex(boresightw ? DMSConvert(boresightw.values[0]) : 'N/A');
        setBorey(boresightw ? DMSConvert(boresightw.values[1]) : 'N/A');
        
        
    }, [keywords]);

    return (
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={1}>
        <Grid container columnSpacing={2} rowSpacing={1} columns={20}>
            <Grid size={2}>
                Object
            </Grid>
            <Grid size={1}>
                {sysconstlist[objSysw ? objSysw.values[0] : 'Unknown'][0]}
            </Grid>
            <Grid size={4}>
                {offpos1}°'"
            </Grid>
            <Grid size={7} sx={{ whiteSpace: 'pre' }}>
                (X          {objxoff}°'")
            </Grid>
            <Grid size={1}>
                Bore         
            </Grid>
            <Grid size={1}>
                X  
            </Grid>
            <Grid size={4}>
                {borex}°'"
            </Grid>


            <Grid size={2}>
                Arc Off
            </Grid>
            <Grid size={1}>
                {sysconstlist[objSysw ? objSysw.values[0] : 'Unknown'][1]}
            </Grid>
            <Grid size={4}>
                {offpos2}°'"
            </Grid>
            <Grid size={7} sx={{ whiteSpace: 'pre' }}>
                (Y          {objyoff}°'")
            </Grid>
            <Grid size={1} />
            <Grid size={1}>
                Y         
            </Grid>
            <Grid size={4}>
                {borey}°'"
            </Grid>
        </Grid>
        </Box>
    )
}