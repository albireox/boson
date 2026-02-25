import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';


export default function MidLevel(){

    return (
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={2}>
        <p>Prim state</p>
        <p>Sec state</p>
        </Box>
    )


}