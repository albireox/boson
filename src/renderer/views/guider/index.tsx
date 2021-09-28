/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-14
 *  @Filename: guider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */
/** @jsxImportSource @emotion/react */

import { KeywordMap } from 'main/tron';
import * as React from 'react';
import { useKeywords } from '../../hooks';

const AddScript = (path: string, async: boolean = true) => {
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

const JS9: React.FC<{ keywords: KeywordMap }> = ({ keywords }) => {
  React.useEffect(() => {
    if (keywords === undefined || keywords['fliswarm.filename'] === undefined)
      return;
    let values = keywords['fliswarm.filename'].values;
    if (values[0] === 'gfa1') {
      window.JS9.Load(`http://localhost:8080/${values[2]}`);
    }
  }, [keywords]);

  return <div className='JS9' />;
};

export default function GuiderView() {
  const keywords = useKeywords(['fliswarm.filename'], 'guider-filename');

  AddScript(process.env.PUBLIC_URL + '/js9prefs.js', false);
  AddScript(process.env.PUBLIC_URL + '/js9/js9support.js', false);
  AddScript(process.env.PUBLIC_URL + '/js9/js9.js', false);
  AddScript(process.env.PUBLIC_URL + '/js9/js9plugins.js', false);

  return <JS9 keywords={keywords} />;
}
