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
    const sinLat = sind(lat);
    const cosLat = cosd(lat);

    //convert cartesian azAlt to cartesian HA/Dec
    const haDecDC: number[] = [0, 0, 0];
    haDecDC[0] = sinLat * azAltDC[0] + cosLat * azAltDC[2];
    haDecDC[1] = azAltDC[1];
    haDecDC[2] = -cosLat * azAltDC[0] + sinLat * azAltDC[2];

    //now we convert -ha/dec direction cosines to spherical -ha/dec

    try {
        //have to wrap in try/catch because SCfromDC, which calls SCFromCC, throws an error
    const haDecSC = SCFromDC(haDecDC);
    const HA = wrapCtr(-haDecSC[0]);
    const dec = haDecSC[1];
    const atPole = haDecSC[2];

    
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
