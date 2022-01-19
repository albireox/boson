/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-12-26
 *  @Filename: snapshots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import { styled } from '@mui/system';
import React from 'react';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { useKeywords, useWindowSize } from 'renderer/hooks';
let host: string = window.api.store.get_sync('user.connection.httpHost');
let port: number = window.api.store.get_sync('user.connection.httpPort');

if (~host.startsWith('http')) host = 'http://' + host;

const ButtonBlue = styled(Button)(({ theme }) => ({
  backgroundColor: blue[700],
  color: 'white',
  '&.Mui-disabled': { backgroundColor: grey[500], color: grey[300] }
}));

export default function SnapshotsView() {
  const keywords = useKeywords(['jaeger.configuration_snapshot', 'jaeger.snapshot'], 'snapshots');

  const [snapshots, setSnapshots] = React.useState<string[]>([]);
  const [index, setIndex] = React.useState<number>(1);

  const [scale, setScale] = React.useState<number>(1.0);
  const [disabledPrevious, setDisabledPrevious] = React.useState(true);
  const [disabledNext, setDisabledNext] = React.useState(true);

  let win_size = useWindowSize();

  React.useEffect(() => {
    for (const kk of ['jaeger.configuration_snapshot', 'jaeger.snapshot']) {
      if (!keywords[kk]) return;

      const path = keywords[kk].values[0];

      setSnapshots((snaps) => {
        if (snaps.includes(path)) {
          return snaps;
        } else {
          setIndex(snaps.length);
          return [...snaps, path];
        }
      });
    }
  }, [keywords]);

  const increaseScale = () => {
    setScale((s) => {
      if (s >= 4.0) {
        return 4.0;
      } else {
        return s + 0.5;
      }
    });
  };

  const decreaseScale = () => {
    setScale((s) => {
      if (s === 1) {
        return 1;
      } else {
        return s - 0.5;
      }
    });
  };

  const openInBrowser = () => {
    window.api.openInBrowser(`${host}:${port}/${snapshots[index]}`);
  };

  const updateButtons = () => {
    if (index === snapshots.length - 1) {
      setDisabledNext(true);
    } else {
      setDisabledNext(false);
    }

    if (index === 0) {
      setDisabledPrevious(true);
    } else {
      setDisabledPrevious(false);
    }
  };

  return (
    <div
      style={{
        overflow: scale === 1 ? 'hidden' : 'scroll',
        backgroundColor: 'white',
        height: win_size.height
      }}
    >
      <Stack
        direction='row'
        spacing={1}
        sx={{ zIndex: 1, position: 'fixed', width: '100%' }}
        padding={1}
      >
        <Stack direction='row' spacing={1} sx={{ alignSelf: 'left' }}>
          <ButtonGroup variant='contained'>
            <ButtonBlue
              onClick={() => setIndex((idx) => (idx === 0 ? 0 : idx - 1))}
              sx={{ padding: 0 }}
              disabled={disabledPrevious}
            >
              <ArrowBackIosIcon />
            </ButtonBlue>
            <ButtonBlue
              onClick={() => setIndex((idx) => (idx === snapshots.length - 1 ? idx : idx + 1))}
              sx={{ padding: 0 }}
              disabled={disabledNext}
            >
              <ArrowForwardIosIcon />
            </ButtonBlue>
          </ButtonGroup>

          <ButtonBlue
            variant='contained'
            size='medium'
            endIcon={<OpenInBrowserIcon />}
            onClick={openInBrowser}
          >
            Open in browser
          </ButtonBlue>
        </Stack>
        <Stack sx={{ flexGrow: 1, alignItems: 'center', alignSelf: 'center' }}>
          <Typography variant='h5' color={grey[800]}>
            {snapshots[index] ? snapshots[index].split('/').reverse()[0] : ''}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1} sx={{ alignSelf: 'right' }}>
          <ButtonBlue variant='contained' size='medium' onClick={() => setScale(1)}>
            Fit
          </ButtonBlue>
          <ButtonGroup variant='contained'>
            <ButtonBlue onClick={decreaseScale}>-</ButtonBlue>
            <ButtonBlue onClick={increaseScale}>+</ButtonBlue>
          </ButtonGroup>
        </Stack>
      </Stack>
      <Document
        file={`${host}:${port}/${snapshots[index]}`}
        renderMode='canvas'
        onLoadProgress={updateButtons}
      >
        <Page pageNumber={1} scale={scale} width={win_size.width} />
      </Document>
    </div>
  );
}
