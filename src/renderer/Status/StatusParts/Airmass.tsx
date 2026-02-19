const _MinAlt = 3.0;
import { sind } from './MathUtil';

export function Airmass(alt: number): number {
    //returns the airmass given the altitude in degrees
    const secM1 = (1.0 / sind(Math.max(_MinAlt,alt))) - 1.0;
    return 1.0 + secM1 * (0.9981833 - secM1 * (0.002875 + (0.0008083 * secM1)));

}