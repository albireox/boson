import React from 'react';

export function HMSConvert(decimalDegrees: number): string {
    const hours = decimalDegrees / 15;
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = ((hours - h) -(m/60)) * 3600;

    const pad2 = (num: number | String) => num.toString().padStart(2, '0');

    return `${pad2(h)}:${pad2(m)}:${pad2(s.toFixed(1))}`;
}

export function DMSConvert(decimalDegrees: number): string {
    const d = Math.floor(decimalDegrees);
    const m = Math.floor((decimalDegrees - d) * 60);
    const s = ((decimalDegrees - d) - (m/60)) * 3600;

    const pad2 = (num: number | String) => num.toString().padStart(2, '0');

    return `${pad2(d)}:${pad2(m)}:${pad2(s.toFixed(2))}`;
}
