import React from 'react';
import Button from '@mui/material/Button';
import { CssBaseline, Box, Stack } from '@mui/material';
import { KeywordContext, useKeywords } from 'renderer/hooks';
import TopPart from './StatusParts/TopPart';



function MyButton({ title }: { title: string }) {
    return <Button variant="contained">{title}</Button>;
    }

export default function Status() {

    return (
        <Box
        component='main'
        display='flex'
        position='absolute'
        width='100%'
        top={0}>

        <CssBaseline />
        <TopPart />
        
        </Box>
    );
}
