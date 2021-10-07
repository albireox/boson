/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: js9.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import { Tooltip } from '@mui/material';
import { KeywordMap } from 'main/tron/types';
import React from 'react';
import { useWindowSize } from 'renderer/hooks';
import { IJS9Opts, JS9Opts } from '.';

export const JS9: React.FC<{
  keywords: KeywordMap;
  gid: number;
  opts: IJS9Opts;
}> = ({ keywords, gid, opts }) => {
  let size = useWindowSize();

  const [currentImage, setCurrentImage] = React.useState<string>('');
  const [first, setFirst] = React.useState(true);

  let display = `gfa${gid}`;

  React.useEffect(() => {
    if (keywords === undefined || keywords['fliswarm.filename'] === undefined) return;

    let now = new Date();
    if (now.getTime() - keywords['fliswarm.filename'].lastSeenAt.getTime() > 5000) {
      return;
    }

    let values = keywords['fliswarm.filename'].values;

    if (currentImage === values[2] || values[0] !== display) {
      return;
    }

    let load_opts = first
      ? {
          scale: JS9Opts.scale,
          colormap: JS9Opts.colormap,
          zoom: 'toFit'
        }
      : {};

    setTimeout(() => {
      window.JS9.Load(`http://localhost:8080/${values[2]}`, load_opts, {
        display: display
      });
      window.JS9.SetImageInherit(true, { display: display });
    }, 500);

    setCurrentImage(values[2]);
    if (first) setFirst(false);
  }, [keywords, display, currentImage, first]);

  React.useEffect(() => {
    window.JS9.SetColormap(opts.colormap, { display: display });
    window.JS9.SetScale(opts.scale, { display: display });
  }, [opts, display]);

  let js9_size = Math.round((size.height || 800) / 4);
  if (js9_size > (size.width || 700) / 3) js9_size = (size.width || 700) / 3;

  return (
    <Tooltip title={currentImage}>
      <div
        className='JS9'
        style={{ width: js9_size, height: js9_size }}
        css={(theme: any) => ({
          'div.JS9Container > canvas.JS9Image': {
            backgroundColor: theme.palette.background.default,
            backgroundImage: first
              ? `url(${process.env.PUBLIC_URL + '/images/SDSS-V.png'})`
              : 'none',
            backgroundSize: 'cover',
            backgroundBlendMode: 'hard-light',
            backgroundPosition: 'center',
            width: js9_size,
            height: js9_size
          }
        })}
        data-width={js9_size}
        data-height={js9_size}
        id={display}
      />
    </Tooltip>
  );
};
