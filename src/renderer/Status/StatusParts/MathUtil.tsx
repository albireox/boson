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

export function atan2d(y: number, x: number): number {
    return Math.atan2(y, x) * DegPerRad;
}

export function wrapCtr(degrees: number): number {
    //returns the angle (in degrees) wrapped into the range (-180, 180])
    let ctrAng = degrees % 360.0;
    if (ctrAng > 180.0) {
        ctrAng -= 360.0;
    }
    return ctrAng;
}

export function wrapPos(degrees: number): number {
    const res = degrees % 360.0;
    if (res < 0) {
        return res + 360.0;
    }
    return res;
}