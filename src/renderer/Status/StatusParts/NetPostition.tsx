import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { HMSConvert, DMSConvert } from './HMSConvert';

//make sure to rename files
export default function NetPosition() {
    const keywords = useKeywords([
            'tcc.AxePos', // az, alt, rot
            'jaeger.configuration_loaded'
        ])

    const [az, setAz] = React.useState<string>(''); //in a HH:MM:SS format? ask
    const [alt, setAlt] = React.useState<string>('');
    const [rot, setRot] = React.useState<string>('');

    const { AxePos: axePosw } = keywords;

    React.useEffect(() => {
        if (!axePosw) {
            setAz('N/A');
            setAlt('N/A');
            setRot('N/A');
            return;
        }
        setAz(DMSConvert(axePosw.values[0]));
        setAlt(DMSConvert(axePosw.values[1]));
        setRot(DMSConvert(axePosw.values[2]));
        
    }, [axePosw]);

    return (
        <Box display='flex' flexDirection='column' p={2} pt={5}>
            <Box>Name</Box>
            <Box pl={4}>
                <strong>Az:{"   "}</strong> {az}{"   "}°'"
            </Box>
            <Box pl={4}>
                <strong>Alt:{"   "}</strong> {alt}{"   "}°'"            
            </Box>
            <Box>CSys Mount</Box>
            <Box pl={4}>
                <strong>Rot:{"   "}</strong> {rot}{"   "}° Mount
            </Box>
        </Box>
    )
}