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

export function playSound(type: string) {
  const file = store.get(`sounds.${type}`, null);
  if (!file) return;

  if (path.isAbsolute(file)) {
    sound.play(file);
  } else {
    sound.play(path.join(__dirname, '../sounds', file));
  }
}
