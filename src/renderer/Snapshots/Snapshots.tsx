/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-12-26
 *  @Filename: snapshots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable @typescript-eslint/naming-convention */

import { Box, CssBaseline, Stack } from '@mui/material';
import React from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useKeywords, useStore, useWindowSize } from 'renderer/hooks';
import Header from './Header/Header';
import PdfViewer from './PdfViewer';
import StatusSnackBar from './StatusSnackbar';

export default function Snapshots() {
  const keywords = useKeywords('jaeger', [
    'configuration_snapshot',
    'snapshot',
    'folded',
    'locked',
    'locked_by',
    'fps_status',
  ]);

  const { locked, locked_by, fps_status, folded } = keywords;

  const [httpHost] = useStore<string>('connection.httpHost');
  const [httpPort] = useStore<string>('connection.httpPort');

  const [snapshots, setSnapshots] = React.useState<string[]>([]);
  const [index, setIndex] = React.useState<number>(1);

  const [scale, setScale] = React.useState<number>(1.0);

  const [searchText, setSearchText] = React.useState('');

  const divRef = React.useRef<HTMLDivElement>(null);

  const winSize = useWindowSize();

  React.useEffect(() => {
    const { configuration_snapshot, snapshot } = keywords;

    [configuration_snapshot, snapshot].forEach((snapKey) => {
      if (!snapKey) return;

      let path = `${httpHost}:${httpPort}/${snapKey.values[0]}`;
      if (~path.startsWith('http')) path = `http://${path}`;

      setSnapshots((snaps) => {
        if (snaps.includes(path)) {
          return snaps;
        }
        setIndex(snaps.length);
        return [...snaps, path];
      });
    });
  }, [keywords, httpHost, httpPort]);

  React.useEffect(() => {
    // This prevents an issue in which if we have scrolled while zoommed in and then set
    // the scale back to 1, the document is not fully scrolled up and overlaps with the menubar.
    if (scale === 1 && divRef.current) {
      divRef.current.scrollTo(0, 0);
    }
  }, [scale]);

  const openInBrowser = React.useCallback(() => {
    window.electron.tools.openInBrowser(`${snapshots[index]}`);
  }, [snapshots, index]);

  React.useEffect(() => {
    if (!locked || !locked_by) return;

    if (locked.values[0] === 'T' && locked_by.values.length > 0) {
      setSearchText(locked_by.values[0].toString());
    }
  }, [locked, locked_by]);

  return (
    <Box
      component='main'
      ref={divRef}
      display='flex'
      position='absolute'
      width='100%'
      top={0}
    >
      <CssBaseline />
      <Stack direction='column' height='100%'>
        <Header
          files={snapshots}
          index={index}
          searchText={searchText}
          onSearchChanged={setSearchText}
          onScaleChanged={setScale}
          onOpenInBrowserClick={openInBrowser}
          onUpdateIndex={setIndex}
        />
        <PdfViewer
          files={snapshots}
          index={index}
          width={winSize.width}
          scale={scale}
          searchText={searchText}
        />
      </Stack>
      <StatusSnackBar
        isLockedKw={locked}
        fpsStatusKw={fps_status}
        isFoldedKw={folded}
      />
    </Box>
  );
}
