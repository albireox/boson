import React from 'react';
import Button from '@mui/material/Button';
import { CssBaseline, Box, Stack } from '@mui/material';
import { KeywordContext, useKeywords } from 'renderer/hooks';
import NetPosition from './StatusParts/NetPostition';
import MiscStatus from './StatusParts/MiscStatus';
import OffsetStatus from './StatusParts/OffsetStatus';
import AxisOffsetStatus from './StatusParts/AxisOffsetStatus';
import AxisStatus from './StatusParts/AxisStatus';




export default function Status() {

    return (
        <Box
        component='main'
        display='flex'
        position='absolute'
        width='100%'
        top={0}>

        <CssBaseline />
        <NetPosition />
        <MiscStatus />
        <OffsetStatus />
        <AxisOffsetStatus />
        <AxisStatus />
        </Box>
    );
}
