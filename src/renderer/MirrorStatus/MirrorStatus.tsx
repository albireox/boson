import Grid from '@mui/material/Unstable_Grid2';
import { CssBaseline, Box, Stack } from '@mui/material';
import { KeywordContext, useKeywords } from 'renderer/hooks';
import TopLevel from './Components/TopLevel';
import MidLevel from './Components/MidLevel';
import BottomLevel from './Components/BottomLevel';


export default function MirrorStatus() {

    return (
        <Box
        component='main'
        display='flex'
        position='absolute'
        width='100%'
        top={0}>

        <CssBaseline />
        <TopLevel />
        <MidLevel />
        <BottomLevel />
        </Box>
    )

}