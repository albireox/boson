/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: tools.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

export const loadExternalScript = (url: string) => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let script: any = document.querySelector(`script[src="${url}"]`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleScript = (e: any) => {
      return e.type === 'load'
        ? resolve(true)
        : reject(new Error('Failed loading script'));
    };

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/javascript';
      script.src = url;
      script.async = true;
      document.body.appendChild(script);
      script.addEventListener('load', handleScript);
      script.addEventListener('error', handleScript);
    }

    script.addEventListener('load', handleScript);
    script.addEventListener('error', handleScript);

    return () => {
      script?.removeEventListener('load', handleScript);
      script?.removeEventListener('error', handleScript);
    };
  });
};

export function useLoadJS9() {
  // Loads the JS9 scripts dynamically. A hack ...

  const [state, setState] = React.useState(false);

  loadExternalScript('/js9prefs.js')
    .then(() =>
      loadExternalScript('/js9_source/js9support.min.js')
        .then(() =>
          loadExternalScript('/js9_source/js9.min.js')
            .then(() => setState(true))
            .catch(() => {})
        )
        .catch(() => {})
    )
    .catch(() => {});

  return state;
}
