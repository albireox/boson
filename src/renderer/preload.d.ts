import ElectronAPI from '../main/preload';

declare global {
  interface Window {
    electron: typeof ElectronAPI;
  }
}

export {};
