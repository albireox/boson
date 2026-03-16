/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: HMSConvert.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


export function HMSConvert(decimalDegrees: number): string {
    //converts decimal degrees to hours, minutes, seconds in the format of "hh:mm:ss.ss"
    const hours = decimalDegrees / 15;
    const sign = hours < 0 ? '-' : '';
    const absHours = Math.abs(hours);
    const h = Math.trunc(absHours);
    const m = Math.trunc((absHours - h) * 60);
    const s = ((absHours - h) -(m/60)) * 3600;

    const pad2 = (num: number | String) => num.toString().padStart(2, '0');

    return `${sign}${pad2(h)}:${pad2(m)}:${pad2(s.toFixed(2))}`;
}

export function HMSConvertNoDecimal(decimalDegrees: number): string {
    //converts decimal degrees to hours, minutes, seconds in the format of "hh:mm:ss" without decimal seconds
    const hours = decimalDegrees / 15;
    const sign = hours < 0 ? '-' : '';
    const absHours = Math.abs(hours);
    const h = Math.trunc(absHours);
    const m = Math.trunc((absHours - h) * 60);
    const s = ((absHours - h) -(m/60)) * 3600;

    const pad2 = (num: number | String) => num.toString().padStart(2, '0');

    return `${sign}${pad2(h)}:${pad2(m)}:${pad2(s.toFixed(0))}`;
}

export function DMSConvert(decimalDegrees: number): string {
    //converts decimal degrees to degrees, minutes, seconds in the format of "dd:mm:ss.ss"
    const sign = decimalDegrees < 0 ? '-' : '';
    const absDegrees = Math.abs(decimalDegrees);
    const d = Math.trunc(absDegrees);
    const m = Math.trunc((absDegrees - d) * 60);
    const s = ((absDegrees - d) - (m/60)) * 3600;

    const pad2 = (num: number | String) => num.toString().padStart(2, '0');

    return `${sign}${pad2(d)}:${pad2(m)}:${pad2(s.toFixed(2))}`;
}
