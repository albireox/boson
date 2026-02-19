const InstNameDict = new Map<any,any>();
InstNameDict.set(0, "None");
import React from 'react';
import { useKeywords } from 'renderer/hooks';

export default function Cartridge(cartridgeNum: number | null | undefined | string): string {
    var instName = InstNameDict.get(cartridgeNum);

    if (instName){
        return instName;
    } else {
        var guiderInstNum = null;
        if (cartridgeNum == null || cartridgeNum == undefined || cartridgeNum == '?') { 
            instName = '?';
        } else {
            instName = cartridgeNum.toString();
        }

        if (cartridgeNum == null || cartridgeNum == undefined) {
            return instName;
        } else {
            guiderInstNum = '?';
            return `${instName} mcp ${guiderInstNum} gdr`;
        }
    }
}