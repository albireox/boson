export const RadPerDeg = Math.PI / 180;
export const DegPerRad = 1.0 / RadPerDeg;
export const hoursPerDeg = 24.0 / 360.0;

export function sind(degrees: number): number {
    return Math.sin(degrees * RadPerDeg);
}

export function cosd(degrees: number): number {
    return Math.cos(degrees * RadPerDeg);
}

export function tand(degrees: number): number {
    return Math.tan(degrees * RadPerDeg);
}

export function atan2d(x: number, y: number): number {
    return Math.atan2(x, y) * DegPerRad;
}

export function wrapCtr(degrees: number): number {
    //returns the angle (in degrees) wrapped into the range (-180, 180])
    let ctrAng = ((degrees % 360.0) + 360.0) % 360.0;
    if (ctrAng > 180.0) {
        ctrAng -= 360.0;
    }
    return ctrAng;
}

export function modulo(degrees: number, modulus: number): number {
    return ((degrees % modulus) + modulus) % modulus;
}

export function rot2D(xyVec: number[], angDeg: number): { xRot: number, yRot: number } {
    //rotates a 2D vector by the specified angle (in degrees)
    let x: number = xyVec[0];
    let y: number = xyVec[1];
    let sinAng = sind(angDeg);
    let cosAng = cosd(angDeg);
    let xRot = (x * cosAng) - (y * sinAng);
    let yRot = (x * sinAng) + (y * cosAng);
    return { xRot, yRot };
}

export function wrapPos(degrees: number): number {
    const res = ((degrees % 360.0) + 360.0) % 360.0;
    if (res < 0) {
        return res + 360.0;
    }
    return res;
}