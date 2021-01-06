import gpsTime from 'gps-time';

export function getTAITime() {
  return new Date(gpsTime.toGPSMS(new Date()) + 19000);
}
