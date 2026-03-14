/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: NetPosition.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import { Box } from '@mui/system';
import React from 'react';
import { useKeywords } from 'renderer/hooks';
import { HMSConvert, DMSConvert } from './HMSConvert';
import { sysconstlist } from './SysConstList';


export default function NetPosition() {
    const keywords = useKeywords([
            'tcc.ObjNetPos',
            'tcc.ObjSys', 
            'tcc.RotPos',
            'tcc.RotType',
            'tcc.ObjName',
            'jaeger.configuration_loaded'

        ])

    const [netPos1, setnetPos1] = React.useState<string>(''); //net position, changes depending on the objsys
    const [netPos2, setnetPos2] = React.useState<string>('');
    const [rot, setRot] = React.useState<string>('');
    const [objName, setObjName] = React.useState<string>('');
    const [objSys, setObjSys] = React.useState<string>(''); //for the pos type, should change depending on the objsys
    const [netPos1Type, setNetPos1Type] = React.useState<string>(''); //RA, Dec, Az, Alt, etc
    const [netPos2Type, setNetPos2Type] = React.useState<string>(''); //RA, Dec, Az, Alt, etc
    const [rotType, setRotType] = React.useState<string>(''); //for the rot type, should change depending on the rottype


    const { 
            ObjNetPos: objNetPosw,
            ObjSys: objSysw,
            RotPos: rotPosw,
            ObjName: objNamew,
            RotType: rotTypew
     } = keywords;


    React.useEffect(() => {
        
        //console.log(`Net position:`,rotPosw);
        setRot(rotPosw ? rotPosw.values[0] : 'N/A');
        setObjName(objNamew ? objNamew.values[0] : 'N/A');
        setObjSys(objSysw ? objSysw.values[0] : 'N/A');
        setNetPos1Type(sysconstlist[objSysw ? objSysw.values[0] : 'Unknown'][0]);
        setNetPos2Type(sysconstlist[objSysw ? objSysw.values[0] : 'Unknown'][1]);
        if (netPos1Type === "RA") {
            setnetPos1(HMSConvert(objNetPosw ? objNetPosw.values[0] : 'N/A'));
        } else {
            setnetPos1(DMSConvert(objNetPosw ? objNetPosw.values[0] : 'N/A'));
        }
        setnetPos2(DMSConvert(objNetPosw ? objNetPosw.values[3] : 'N/A'));

        setRotType(rotTypew ? rotTypew.values[0] : 'N/A');
        
    }, [keywords]);

    return (
        <Box display='flex' flexDirection='column' p={2} pt={1}>
            <Box>Name {objName}</Box>
            <Box pl={4}>
                <strong>{netPos1Type}:{"   "}</strong> {netPos1}{"   "}{netPos1Type === "RA" ? "hms" : `°'" `}
            </Box>
            <Box pl={4}>
                <strong>{netPos2Type}:{"   "}</strong> {netPos2}{"   "}°'"            
            </Box>
            <Box>CSys {objSys}</Box>
            <Box pl={4}>
                <strong>Rot:{"   "}</strong> {rot}{"   "}° {rotType}
            </Box>
        </Box>
    )
}