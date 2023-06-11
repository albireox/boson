/* eslint import/prefer-default-export: off */
import path from 'path';
import sound from 'sound-play';
import { URL } from 'url';
import { store } from './store';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}/${htmlFileName}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(
    __dirname,
    `../renderer/index.html?${htmlFileName}`
  )}`;
}

export interface PlaySoundOpts {
  overrideMode: boolean;
}

export function playSound(type: string, opts?: PlaySoundOpts) {
  const { overrideMode = false } = opts || {};

  const file = store.get(`audio.sounds.${type}`, null);
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
  } else {
    sound.play(path.join(__dirname, '../sounds', file));
  }
}
