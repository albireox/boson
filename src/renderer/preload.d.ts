/* eslint-disable @typescript-eslint/no-explicit-any */

import ElectronAPI from 'main/preload';

declare module './*.js?url' {
  const value: string;
  export = value;
}

declare module '/*.png' {
  const value: any;
  export = value;
}

declare global {
  interface Window {
    electron: typeof ElectronAPI;
    JS9: any;
  }
}

declare module '@mui/material/styles' {
  interface TypeAction {
    boxBackground: React.CSSProperties['color'];
  }
}

export {};
