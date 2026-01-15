import React from 'react';
import Button from '@mui/material/Button';
import { CssBaseline, Box, Stack } from '@mui/material';
import { KeywordContext, useKeywords } from 'renderer/hooks';
import StatusHeader from './Header/StatusHeader';
import StatusPanels from './Header/StatusPanels';


function MyButton({ title }: { title: string }) {
    return <Button variant="contained">{title}</Button>;
    }

export default function Status() {

    const statusKeywords = useKeywords([
        'status.coordsys_ICRS',
        'status.coordsys_FK5',
        'status.coordsys_FK4',
        'status.coordsys_galactic',
        'status.coordsys_geocentric',
        'status.coordsys_topocentric',
        'status.coordsys_observed',
        'status.coordsys_physical',
        'status.coordsys_mount',
        'jaeger.configuration_loaded',
        'jaeger.design_preloaded',
        'jaeger.preloaded_is_cloned',
    ])

    return (
        <Box
        component='main'
        display='flex'
        position='absolute'
        width='100%'
        top={0}>

        <CssBaseline />

        <MyButton title="Click Me" />
        </Box>
    );
}
