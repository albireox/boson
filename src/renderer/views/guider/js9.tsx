/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: js9.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/** @jsxImportSource @emotion/react */

import CancelIcon from '@mui/icons-material/Cancel';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { KeywordMap } from 'main/tron/types';
import React from 'react';
import { useKeywords, useWindowSize } from 'renderer/hooks';
import { IJS9Opts, JS9Opts } from '.';
import { MenuBar } from './menubar';

export const JS9: React.FC<{
  keywords: KeywordMap;
  size: number;
  gid: number;
  opts: IJS9Opts;
  zoomed: number;
  setZoomed: (arg0: number) => void;
}> = ({ keywords, gid, size, opts, zoomed, setZoomed }) => {
  const [currentImage, setCurrentImage] = React.useState<string>('');
  const [first, setFirst] = React.useState(true);

  const [hostname, setHostname] = React.useState('');
  const [port, setPort] = React.useState('');

  window.api.store.get('user.connection.httpHost').then((value) => {
    setHostname(value);
  });
  window.api.store.get('user.connection.httpPort').then((value) => {
    setPort(value);
  });

  let display = `gfa${gid}`;
  const visible = zoomed === 0 || (zoomed && gid === zoomed);

  React.useEffect(() => {
    if (keywords === undefined || keywords['fliswarm.filename'] === undefined) return;

    let now = new Date();
    if (now.getTime() - keywords['fliswarm.filename'].lastSeenAt.getTime() > 5000) {
      return;
    }

    let values = keywords['fliswarm.filename'].values;

    if (currentImage === values[2] || values[0] !== `gfa${gid}`) return;
    if (hostname === '' || port === '') return;

    let load_opts = first
      ? {
          scale: JS9Opts.scale,
          colormap: JS9Opts.colormap,
          zoom: 'toFit'
        }
      : {};

    setTimeout(() => {
      window.JS9.Load(`http://${hostname}:${port}${values[2]}`, load_opts, {
        display: display
      });
      window.JS9.SetImageInherit(true, { display: display });
    }, 3000);

    setCurrentImage(values[2]);
    if (first) {
      setFirst(false);
    }
  }, [keywords, display, currentImage, first, gid, hostname, port]);

  React.useEffect(() => {
    window.JS9.SetColormap(opts.colormap, { display: display });
    window.JS9.SetScale(opts.scale, { display: display });
  }, [opts, display]);

  return (
    <Tooltip title={currentImage}>
      <div
        className='JS9'
        style={{
          width: size,
          height: size,
          display: visible ? 'inherit' : 'none'
        }}
        css={(theme: any) => ({
          'div.JS9Container > canvas.JS9Image': {
            backgroundColor: theme.palette.background.default,
            backgroundImage: first
              ? `url(${process.env.PUBLIC_URL + '/images/SDSS-V.png'})`
              : 'none',
            backgroundSize: 'cover',
            backgroundBlendMode: 'hard-light',
            backgroundPosition: 'center',
            width: size,
            height: size,
            zIndex: 0
          }
        })}
        data-width={size}
        data-height={size}
        id={display}
        onDoubleClick={() => setZoomed(gid)}
      >
        <IconButton
          size='large'
          color='secondary'
          sx={{
            position: 'absolute',
            right: '0px',
            top: '0px',
            visibility: zoomed === gid ? 'visible' : 'hidden',
            zIndex: 10
          }}
          onClick={() => setZoomed(0)}
        >
          <CancelIcon fontSize='inherit' />
        </IconButton>
      </div>
    </Tooltip>
  );
};

export function JS9Frame() {
  const keywords = useKeywords(['fliswarm.filename'], 'guider-filename', false);
  let win_size = useWindowSize();

  const [zoomed, setZoomed] = React.useState<number>(0);
  const [opts, setOpts] = React.useState<IJS9Opts>(JS9Opts);
  const onOptsUpdate = (newOpts: Partial<IJS9Opts>) => {
    setOpts({ ...opts, ...newOpts });
  };

  window.JS9.globalOpts['mouseActions'][0] = 'none';
  window.JS9.globalOpts['resize'] = false;

  let default_size = Math.round((win_size.height || 800) / 4);
  if (default_size > (win_size.width || 700) / 3) default_size = (win_size.width || 700) / 3;

  return (
    <>
      <MenuBar
        style={{
          marginBottom: '4px',
          display: 'flex',
          flexDirection: 'row'
        }}
        onUpdate={onOptsUpdate}
      />
      <Stack width='100%' display='flex' flexDirection='row' justifyContent='center'>
        {[1, 2, 3].map((gid: number) => (
          <JS9
            key={`gfa${gid}`}
            keywords={keywords}
            opts={opts}
            size={zoomed ? 2 * default_size : default_size}
            gid={gid}
            setZoomed={setZoomed}
            zoomed={zoomed}
          />
        ))}
      </Stack>
      <Stack width='100%' display='flex' flexDirection='row' justifyContent='center'>
        {[4, 5, 6].map((gid: number) => (
          <JS9
            key={`gfa${gid}`}
            keywords={keywords}
            opts={opts}
            size={zoomed ? 2 * default_size : default_size}
            gid={gid}
            setZoomed={setZoomed}
            zoomed={zoomed}
          />
        ))}
      </Stack>
    </>
  );
}
