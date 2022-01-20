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

type JS9Props = {
  keywords: KeywordMap;
  size: number;
  gid: number;
  opts: IJS9Opts;
  zoomed: number;
  selected: number;
  setZoomed: (arg0: number) => void;
  setSelected: (arg0: number) => void;
  updateURLs: (arg0: number, arg1: string) => void;
};

export const JS9 = ({
  keywords,
  gid,
  size,
  opts,
  zoomed,
  selected,
  setZoomed,
  setSelected,
  updateURLs
}: JS9Props) => {
  const [currentImage, setCurrentImage] = React.useState<string>('');
  const [first, setFirst] = React.useState(true);

  let display = `gfa${gid}`;
  const visible = zoomed === 0 || (zoomed && gid === zoomed);

  React.useEffect(() => {
    const hostname = window.api.store.get_sync('user.connection.httpHost');
    const port = window.api.store.get_sync('user.connection.httpPort');
    const useFullImage = window.api.store.get_sync('user.guider.fullImage');

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

    const fullPath: string = values[2];
    const snapPath = fullPath.replace('.fits', '-snap.fits');

    let url: string;

    if (useFullImage === 'true' || useFullImage === true) {
      url = `http://${hostname}:${port}${fullPath}`;
    } else {
      url = `http://${hostname}:${port}${snapPath}`;
    }

    try {
      window.JS9.Load(url, load_opts, {
        display: display
      });
      window.JS9.SetImageInherit(true, { display: display });
    } catch (err) {
      console.log('Error in JS9', err);
      return;
    }

    setCurrentImage(fullPath);
    updateURLs(gid, `http://${hostname}:${port}${fullPath}`);

    if (first) {
      setFirst(false);
    }
  }, [keywords, display, currentImage, first, gid, updateURLs, zoomed]);

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
          display: visible ? 'block' : 'none'
        }}
        css={(theme: any) => ({
          outline:
            'solid 1px ' +
            (selected === gid && zoomed !== gid ? 'darkred' : theme.palette.background.default),
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
          },
          '.JS9Layer': {
            width: size,
            height: size
          },
          ' .canvas-container': {
            width: size,
            height: size
          }
        })}
        data-width={size}
        data-height={size}
        id={display}
        onDoubleClick={() => setZoomed(gid)}
        onClick={() => setSelected(gid)}
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
          onClick={() => {
            setZoomed(0);
            setSelected(0);
          }}
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
  const [selected, setSelected] = React.useState<number>(0);
  const [urls, setUrls] = React.useState<{ [key: number]: string }>({});

  const [opts, setOpts] = React.useState<IJS9Opts>(JS9Opts);
  const onOptsUpdate = (newOpts: Partial<IJS9Opts>) => {
    setOpts({ ...opts, ...newOpts });
  };

  window.JS9.globalOpts['resize'] = false;
  window.JS9.globalOpts.alerts = false;

  let default_size = Math.round((win_size.width || 800) / 3.2);
  // if (default_size > (win_size.width || 600) / 3) default_size = (win_size.width || 600) / 3;

  const updateSelected = React.useCallback(
    (gid: number) => {
      if (gid === 0) {
        setSelected(0);
      } else if (gid === selected) {
        setSelected(0);
      } else {
        setSelected(gid);
      }
    },
    [selected]
  );

  const updateURLs = (gid: number, url: string) => {
    setUrls((urls) => ({ ...urls, [gid]: url }));
  };

  return (
    <Stack direction='column' spacing={0.5} py={1}>
      <MenuBar
        gidSelected={selected || zoomed}
        urls={urls}
        onUpdate={onOptsUpdate}
        style={{
          marginBottom: '4px',
          display: 'flex',
          flexDirection: 'row'
        }}
      />
      <Stack direction='row' justifyContent='center' spacing={0.5}>
        {[1, 2, 3].map((gid: number) => (
          <JS9
            key={`gfa${gid}`}
            keywords={keywords}
            opts={opts}
            size={zoomed ? 2 * default_size : default_size}
            gid={gid}
            selected={selected}
            setZoomed={setZoomed}
            setSelected={updateSelected}
            updateURLs={updateURLs}
            zoomed={zoomed}
          />
        ))}
      </Stack>
      <Stack direction='row' justifyContent='center' spacing={0.5}>
        {[4, 5, 6].map((gid: number) => (
          <JS9
            key={`gfa${gid}`}
            keywords={keywords}
            opts={opts}
            size={zoomed ? 2 * default_size : default_size}
            gid={gid}
            selected={selected}
            setSelected={updateSelected}
            setZoomed={setZoomed}
            updateURLs={updateURLs}
            zoomed={zoomed}
          />
        ))}
      </Stack>
    </Stack>
  );
}
