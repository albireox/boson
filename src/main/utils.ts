/* eslint import/prefer-default-export: off */
import path from 'path';
import sound from 'sound-play';
import { URL } from 'url';
import { store } from './store';

export function resolveHtmlPath(htmlFileName: string) {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const url = new URL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/${htmlFileName}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.join(
    __dirname,
    `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html?${htmlFileName}`
  )}`;
}

export interface PlaySoundOpts {
  overrideMode: boolean;
}

export function playSound(type: string, opts?: PlaySoundOpts) {
  const { overrideMode = false } = opts || {};

  const soundList = store.get('audio.user_sounds', null);
  // return the file name if it is in the user_sounds list, otherwise get the associated filename for the sound type
  const file = soundList.includes(type) ? type: store.get(`audio.sounds.${type}`, null);
  if (!file) return;

  const mode: string = store.get('audio.mode');
  const minimals: string[] = store.get('audio.minimal');
  const muted = store.get('audio.muted');

  if (!overrideMode) {
    if (muted) return;
    if (mode === 'off') return;
    if (mode === 'minimal' && !minimals.includes(type)) return;
  }
  
  if (path.isAbsolute(file)) {
    sound.play(file);
  } else if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // development
    sound.play(path.join(__dirname, '../../', 'resources', 'sounds', file));
  } else {
    // production
    // This requires extraResource: ['resources/sounds'] in the electron-forge
    // packages config.
    sound.play(path.join(process.resourcesPath, 'sounds', file));
  }
}
