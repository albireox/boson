/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: MirrorStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

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