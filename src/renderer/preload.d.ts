import ElectronAPI from '../main/preload';

declare global {
  interface Window {
    electron: typeof ElectronAPI;
  }
}

declare module '@mui/material/styles' {
  interface TypeAction {
    boxBackground: React.CSSProperties['color'];
  }
}

export {};
