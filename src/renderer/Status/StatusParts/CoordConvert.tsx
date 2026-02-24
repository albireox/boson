//bunch of function for conversion, take from RO python library, but converted to typescript and adapted for our use case.

import { sind, cosd, atan2d } from "./MathUtil";

export function CCFromSC(pos1 : number, pos2 : number, magP : number): number[] {
    //pos 1: spherical position of the object (RA or Az, etc)
    //pos 2: spherical position of the object (Dec or Alt, etc)
    //magP: desired magnitude of the cartesian position vector


    const coords: number[] = [0, 0, 0];
    coords[0] = magP * cosd(pos2) * cosd(pos1);
    coords[1] = magP * cosd(pos2) * sind(pos1);
    coords[2] = magP * sind(pos2);

    return coords;

}

export function DCFromSC(pos1 : number, pos2 : number): number[] {
    //pos 1: spherical position of the object (RA or Az, etc)
    //pos 2: spherical position of the object (Dec or Alt, etc)

    return CCFromSC(pos1, pos2, 1.0);

}

export function SCFromCC(p: number[]): {pos:[number, number], magP: number, atPole: boolean} {
    //returns spherical coordinates of the form [pos1, pos2, magP, atPole] where pos1 and pos2 are the spherical positions of the object (RA or Az, etc) and magP is the magnitude of the cartesian position vector. atPole is a boolean value indicating whether the position vector is too close to the pole (i.e. if x and y are both close to 0).
    //nums is a cartesian position vector of the form [x, y, z]
    const x = p[0];
    const y = p[1];
    const z = p[2];

    const magPxySq = (x*x) + (y*y);
    const magPsq = magPxySq + (z*z);
    const magP = Math.sqrt(magPsq);

    let atPole: boolean;
    let pos1 : number;
    let pos2: number;

    const FAccuracy = 1.0e-14; //accuracy threshold for determining if the position vector is too small

    //make sure |p| is large enough
    if (magPsq < FAccuracy) {
        throw new Error("Position vector is too small to convert to spherical coordinates");
    }
    //check to see if too near the pole
    if (magPxySq < FAccuracy) {
        atPole = true;
        pos1 = 0.0;
        if ( z > 0.0 ) {
            pos2 = 90.0;
        } else {
            pos2 = -90.0;
        }
    } else {
        atPole = false;
        pos1 = atan2d(y, x);
        pos2 = atan2d(z, Math.sqrt(magPxySq));
        if (pos1 < 0.0) {
            pos1 += 360.0;
        }
    }
    //console.log(`pos1: ${pos1}, pos2: ${pos2}, magP: ${magP}, atPole: ${atPole}`);
    return {pos: [pos1, pos2], magP, atPole};
}

export function SCFromDC(nums: number[]): {pos:[number, number], atPole: boolean} {
    //returns pos1, pos2, and atPole
    const sphCoords = SCFromCC(nums);
    return {pos: sphCoords.pos, atPole: sphCoords.atPole};
}