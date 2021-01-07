import gpsTime from 'gps-time';
import { sprintf } from 'sprintf-js';

export function getTAITime() {
  return new Date(gpsTime.toGPSMS(new Date()) + 19000);
}

export function degToDMS(
  deg: number | undefined | null,
  options?: { precision?: number; separator?: string; sign?: boolean }
): string | null {
  if (!deg && deg !== 0) return null;
  let precision = options?.precision || 2;
  let d = Math.floor(deg);
  let m = Math.floor((deg - d) * 60);
  let s = Math.floor(((deg - d) * 60 - m) * 60);
  return sprintf(
    `${options?.sign ? '+' : ''}%d%s%02d%s%0${precision + 3}.${precision}f`,
    d,
    options?.separator || ':',
    m,
    options?.separator || ':',
    s
  );
}
