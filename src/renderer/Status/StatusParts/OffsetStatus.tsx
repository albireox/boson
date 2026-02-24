import Grid from '@mui/material/Unstable_Grid2';
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
        //console.log(objArcOffw);
        if (!objArcOffw) {
            setoffpos1('N/A');
            setoffpos2('N/A');
            return;
        }
        let offpos1 = DMSConvert(objArcOffw.values[0]);
        let offpos2 = DMSConvert(objArcOffw.values[3]);
        let xyVec = [objArcOffw.values[0], objArcOffw.values[3]];
        let objxoff = DMSConvert(rot2D(xyVec, objInstAngw ? objInstAngw.values[0] : 0).xRot);
        let objyoff = DMSConvert(rot2D(xyVec, objInstAngw ? objInstAngw.values[0] : 0).yRot);
        setoffpos1(offpos1);
        setoffpos2(offpos2);
        setBorex(boresightw ? DMSConvert(boresightw.values[0]) : 'N/A');
        setBorey(boresightw ? DMSConvert(boresightw.values[1]) : 'N/A');
        setObjxoff(objxoff);
        setObjyoff(objyoff);
        
        
    }, [keywords]);

    return (
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={1}>
        <Grid container columnSpacing={2} rowSpacing={1} columns={20}>
            <Grid xs={2}>
                Object
            </Grid>
            <Grid xs={1}>
                {sysconstlist[objSysw ? objSysw.values[0] : 'Unknown'][0]}
            </Grid>
            <Grid xs={4}>
                {offpos1}°'"
            </Grid>
            <Grid xs={7} sx={{ whiteSpace: 'pre' }}>
                (X          {objxoff}°'")
            </Grid>
            <Grid xs={1}>
                Bore         
            </Grid>
            <Grid xs={1}>
                X  
            </Grid>
            <Grid xs={4}>
                {borex}°'"
            </Grid>


            <Grid xs={2}>
                Arc Off
            </Grid>
            <Grid xs={1}>
                {sysconstlist[objSysw ? objSysw.values[0] : 'Unknown'][1]}
            </Grid>
            <Grid xs={4}>
                {offpos2}°'"
            </Grid>
            <Grid xs={7} sx={{ whiteSpace: 'pre' }}>
                (Y          {objyoff}°'")
            </Grid>
            <Grid xs={1} />
            <Grid xs={1}>
                Y         
            </Grid>
            <Grid xs={4}>
                {borey}°'"
            </Grid>
        </Grid>
        </Box>
    )
}