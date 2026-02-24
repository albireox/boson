import React from 'react';
import { DMSConvert } from './HMSConvert';
import { DCFromSC, SCFromDC } from './CoordConvert';
import { sind, cosd, wrapCtr } from './MathUtil';

//logic taken from RO python library

export function HAfromAzAlt(az: number, alt: number, lat: number): number {
    //first convert az and alt into degrees
    //convert spherical az/alt (deg) to direction cosines
    const azAltDC = DCFromSC(az, alt);

    //convert az/alt direction cosines to -HA/Dec direction cosines
    //equal to the haDecFromAzAlt in RO
    let sinLat : number = sind(lat);
    let cosLat : number = cosd(lat);

    //convert cartesian azAlt to cartesian HA/Dec
    const haDecDC: number[] = [0, 0, 0];
    haDecDC[0] = sinLat * azAltDC[0] + cosLat * azAltDC[2];
    haDecDC[1] = azAltDC[1];
    haDecDC[2] = (-cosLat) * azAltDC[0] + sinLat * azAltDC[2];

    //now we convert -ha/dec direction cosines to spherical -ha/dec

    try {
        //have to wrap in try/catch because SCfromDC, which calls SCFromCC, throws an error
        const haDecSC = SCFromDC(haDecDC);
        //console.log(`haDecSC:`, haDecSC);
        const HA = wrapCtr(-haDecSC.pos[0]); 
        const atPole = haDecSC.atPole;

    //console.log(HA)
    if (atPole) {
        console.warn("HA is undefined at the pole, returning NaN");
        return NaN; //HA is undefined at the pole, so we return NaN
    } else {
        return HA;
    }
    }  catch (e) {
        return NaN;
    }
    


    
}
