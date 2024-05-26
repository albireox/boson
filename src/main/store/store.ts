/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-05
 *  @Filename: store.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Store from 'electron-store';
import EventEmitter from 'events';
import defaultConfig from './defaults.json';
import userConfig from './user.json';

// Define the store. Only load parameters that can be defined by the user.
// We also export the default config which is the one that won't change
// unless the version of boson changes.
const store = new Store({
  defaults: userConfig,
  watch: true,
  migrations: {
    '>=0.2.0-beta.8': (st) => {
      st.set('guider.refreshInterval', 20);
    },
    '>=0.2.0-beta.14': (st) => {
      st.set('log.saveState', true);
    },
    '>=0.2.1': (st) => {
      st.set('updateChannel', 'stable');
    },
    '>=0.3.0': (st) => {
      st.set('log.showInternal', false);
      st.set('log.highlightCommands', 'mine');
      st.set('hal.syncStages', false);
      st.set('hal.allowGotoFieldAutoMode', true);
      st.delete('hal.useAutoMode' as keyof typeof userConfig);
    },
    '>=0.3.3': (st) => {
      st.set('audio', {
        mode: 'on',
        muted: false,
        minimal: ['error'],
        sounds: {
          error: 'error.wav',
          error_serious: 'synth_error_long.wav',
          warning: 'click.wav',
          axis_halt: 'synth_strings_short.wav',
          axis_slew: 'marimba.wav',
          exposure_start: 'woodblock.wav',
          exposure_end: 'bell_soft_long.wav',
        },
      });
    },
    '>=0.4.3': (st) => {
      st.set('audio.user_sounds', [
        'bar_long.wav',
        'bell_soft_long.wav',
        'bell_soft_short.wav',
        'buzz_error_long.wav',
        'buzz_error_short.wav',
        'chime_long.wav',
        'click.wav',
        'cowbell_high.wav',
        'cowbell_low.wav',
        'error.wav',
        'high_buzz_error.wav',
        'hit_long.wav',
        'jingle_bell.wav',
        'low_error.wav',
        'marimba.wav',
        'marimba_sharp.wav',
        'synth_error_long.wav',
        'synth_soft_short.wav',
        'synth_string_echo.wav',
        'synth_strings_long.wav',
        'synth_strings_short.wav',
        'woodblock.wav',
      ]);
    },
    '>=0.4.5': (st) => {
      st.set('audio.user_sounds', [
        'bar_long.wav',
        'bell_soft_long.wav',
        'bell_soft_short.wav',
        'buzz_error_long.wav',
        'buzz_error_short.wav',
        'chime_long.wav',
        'click.wav',
        'cowbell_high.wav',
        'cowbell_low.wav',
        'error.wav',
        'high_buzz_error.wav',
        'hit_long.wav',
        'jingle_bell.wav',
        'low_error.wav',
        'marimba.wav',
        'marimba_sharp.wav',
        'synth_error_long.wav',
        'synth_soft_short.wav',
        'synth_string_echo.wav',
        'synth_strings_long.wav',
        'synth_strings_short.wav',
        'woodblock.wav',
        'STUI_AxisHalt.wav',
        'STUI_AxisSlew.wav',
        'STUI_AxisTrack.wav',
        'STUI_CommandDone.wav',
        'STUI_CommandFailed.wav',
        'STUI_CriticalAlert.wav',
        'STUI_ExposureBegins.wav',
        'STUI_ExposureEnds.wav',
        'STUI_FiducialCrossing.wav',
        'STUI_Glass.wav',
        'STUI_GuidingBegins.wav',
        'STUI_GuidingEnds.wav',
        'STUI_GuidingFailed.wav',
        'STUI_LogHighlightedText.wav',
        'STUI_MessageReceived.wav',
        'STUI_NoGuideStar.wav',
        'STUI_SeriousAlert.wav',
        'STUI_Silence.wav',
      ]);
    },
  },
});

// Just a sanity check.
if (!store.get('windows.openWindows')) {
  store.set('windows.openWindows', ['main']);
}
if (!(store.get('windows.openWindows') as string[]).includes('main')) {
  store.set(
    'windows.openWindows',
    (store.get('windows.openWindows', []) as string[]).push('main')
  );
}

const subscriptions = new Map<string, () => EventEmitter>();

export { defaultConfig, store, subscriptions };
