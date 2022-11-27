import ElectronAPI from 'main/preload';

declare global {
  interface Window {
    electron: typeof ElectronAPI;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JS9: any;
  }
}

declare module '@mui/material/styles' {
  interface TypeAction {
    boxBackground: React.CSSProperties['color'];
  }
}

export {};
