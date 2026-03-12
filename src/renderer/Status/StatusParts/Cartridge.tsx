/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: Cartridge.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


const InstNameDict = new Map<any,any>();
InstNameDict.set(0, "None");


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