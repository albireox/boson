/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: scripts.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

export const AddScript = (path: string, async: boolean = true) => {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = path;
    script.type = 'text/javascript';
    script.async = async;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [path, async]);
};
