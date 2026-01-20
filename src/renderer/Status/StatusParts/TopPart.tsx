import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';


export default function TopPart() {
    const keywords = useKeywords([
            'tcc.axePos', // az, alt, rot
            'jaeger.configuration_loaded'
        ])

    const [az, setAz] = React.useState<string>('');
    const [alt, setAlt] = React.useState<string>('');
    const [rot, setRot] = React.useState<string>('');

    //const { axePos: axePosw } = keywords;

    console.log(keywords);
    React.useEffect(() => {
        console.log(keywords);
        // if (!ke) {
        //     setAz('N/A');
        //     setAlt('N/A');
        //     setRot('N/A');
        //     return;
        // }
        // setAz(axePosw.values[0]);
        // setAlt(axePosw.values[1]);
        // setRot(axePosw.values[2]);
        
    }, [keywords]);

    return (
        <Box display='flex' flexDirection='column' p={2} pt={5}>
            <Box>Name</Box>
            <Box pl={4}>
                <strong>Az:</strong> {az}°'"
            </Box>
            <Box pl={4}>
                <strong>Alt:</strong> {alt}°'"
            </Box>
            <Box>CSys Mount</Box>
            <Box pl={4}>
                <strong>Rot:</strong> {rot}° Mount
            </Box>
        </Box>
    )
}