import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { CssBaseline, Box, Stack } from '@mui/material';
import { KeywordContext, useKeywords } from 'renderer/hooks';
import NetPosition from './StatusParts/NetPostition';
import MiscStatus from './StatusParts/MiscStatus';
import OffsetStatus from './StatusParts/OffsetStatus';
import AxisOffsetStatus from './StatusParts/AxisOffsetStatus';
import AxisStatus from './StatusParts/AxisStatus';
import SlewStatus from './StatusParts/SlewStatus';




export default function Status() {

    return (
        <Box
        component='main'
        display='flex'
        position='absolute'
        width='100%'
        top={0}>

        <CssBaseline />
        <Grid container columnSpacing={10} rowSpacing={1} columns={3}>
            <Grid xs={1}>
                <NetPosition />
            </Grid>
            <Grid xs={2}>
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
