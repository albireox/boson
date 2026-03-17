/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: Status.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import Grid from '@mui/material/Grid';
import { CssBaseline, Box, Stack } from '@mui/material';
import NetPosition from './StatusParts/NetPostition';
import MiscStatus from './StatusParts/MiscStatus';
import OffsetStatus from './StatusParts/OffsetStatus';
import AxisOffsetStatus from './StatusParts/AxisOffsetStatus';
import AxisStatus from './StatusParts/AxisStatus';
import SlewStatus from './StatusParts/SlewStatus';
import { useEffect } from 'react';
import { BosonHeader } from 'renderer/Components';




export default function Status() {

    return (
        
        <Box
        component='main'
        display='flex'
        position='absolute'
        width='100%'
        top={0}>
        <CssBaseline />
        <BosonHeader/>
        <Grid container columnSpacing={10} rowSpacing={1} columns={3}>
            <Grid size={1}>
                <NetPosition />
            </Grid>
            <Grid size={2}>
                <SlewStatus />
            </Grid>
        </Grid>
        <MiscStatus />
        <OffsetStatus />
        <AxisOffsetStatus />
        <AxisStatus />
        </Box>
    );
}
