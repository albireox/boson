import React from 'react';
import { wrapPos, hoursPerDeg } from './MathUtil';
import { get } from 'lodash';


const TAI_MINUS_UTC_SECONDS = 37;

export function TAIconvert(mjdseconds: number): string {
    const SECONDS_PER_DAY = 86400;
    const MJD_TO_UNIX_DAYS = 40587; // MJD starts 1858-11-17

    const unixTime = (mjdseconds - MJD_TO_UNIX_DAYS * SECONDS_PER_DAY) * 1000; 

    const d = new Date(unixTime);
    //console.log(d);

    //ensure we have two digits for month, day, hour, minute, second
    const pad2 = (num: number) => num.toString().padStart(2, '0');

    const year = d.getUTCFullYear();
    const month = pad2(d.getUTCMonth() + 1); // Months are zero-indexed
    const day = pad2(d.getUTCDate());
    const hour = pad2(d.getUTCHours());
    const minute = pad2(d.getUTCMinutes());
    const second = pad2(d.getUTCSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function getTAIdays(mjdseconds: number): number {
    return Math.floor((mjdseconds / 86400)+0.3); // Convert seconds to days and add 0.3
}

export function convertUTCtoTAI(mjdseconds: number): string {
    const taiSeconds = mjdseconds + 37; // Add 37 seconds to convert UTC to TAI
    return TAIconvert(taiSeconds);
}

export function curDate(): Date {
    return new Date();
}

export function UnixMS(): number {
    return Date.now();
}

export function UnixS(): number {
    return Date.now() / 1000;
}

export function unixSecondsToJulianDay(unixSeconds: number): number {
    return unixSeconds / 86400 + 2440587.5; // Convert seconds to days and add Julian Date of Unix epoch
}

export function unixSecondsToTAI(unixSeconds: number): string {
    const jdUTC = unixSecondsToJulianDay(unixSeconds);
    const mjdUTC = jdUTC - 2400000.5; // Convert Julian Date to Modified Julian Date
    const mjdUTCSeconds = mjdUTC * 86400; // Convert MJD to seconds
    const TAI = mjdUTCSeconds + TAI_MINUS_UTC_SECONDS;
    //now convert to YYYY-MM-DD HH:MM:SS
    return TAIconvert(TAI);

}

export function unixSecondstoSJD(unixSeconds: number): number {
    const jdUTC = unixSecondsToJulianDay(unixSeconds);
    const mjdUTC = jdUTC - 2400000.5; // Convert Julian Date to Modified Julian Date
    const mjdUTCSeconds = mjdUTC * 86400; // Convert MJD to seconds
    const TAI = mjdUTCSeconds + TAI_MINUS_UTC_SECONDS;
    return getTAIdays(TAI);
}


export function getLMST(unixSeconds: number, longitude: number): number {
    const julianday = unixSecondsToJulianDay(unixSeconds);
    const JD0 = Math.floor(julianday - 0.5) + 0.5; // Julian day at previous midnight
    const H = (julianday - JD0) * 24; // Hours since previous midnight
    const D = julianday - 2451545.0; // Days since J2000.0
    const D0 = JD0 - 2451545.0; // Days since J2000.0 at previous midnight
    const T = D / 36525; // Centuries since J2000.0

    let GMST = 6.697374558 + 0.06570982441908 * D0 + 1.00273790935 * H + (T * T * 0.000026);

    GMST = wrapPos(GMST * 15); 

    const LMST = wrapPos(GMST + longitude); 

    return LMST;
}


