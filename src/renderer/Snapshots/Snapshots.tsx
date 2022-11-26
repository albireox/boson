/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-12-26
 *  @Filename: snapshots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable @typescript-eslint/naming-convention */

import { ThemeProvider } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Collapse,
  createTheme,
  CssBaseline,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { blue, grey, purple } from '@mui/material/colors';
import { styled } from '@mui/system';
import React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { TextLayerItemInternal } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useKeywords, useStore, useWindowSize } from 'renderer/hooks';
import PdfViewer from './PdfViewer';

export default function Snapshots() {
  const keywords = useKeywords('jaeger', [
    'configuration_snapshot',
    'snapshot',
    'folded',
    'locked',
    'locked_by',
  ]);

  const [httpHost] = useStore<string>('connection.httpHost');
  const [httpPort] = useStore<string>('connection.httpPort');

  const [snapshots, setSnapshots] = React.useState<string[]>([]);
  const [index, setIndex] = React.useState<number>(1);

  const [scale, setScale] = React.useState<number>(1.0);
  const [disabledPrevious, setDisabledPrevious] = React.useState(true);
  const [disabledNext, setDisabledNext] = React.useState(true);

  const [showSearch, setShowSearch] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

  const divRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const renderHighlight = React.useCallback(
    (layer: TextLayerItemInternal) => {
      if (showSearch) {
        if (
          (searchText.length >= 4 && layer.str.includes(searchText)) ||
          (searchText.length === 3 && layer.str.includes(`P0${searchText}`)) ||
          (searchText.length === 2 && layer.str.includes(`P00${searchText}`)) ||
          (searchText.length === 1 && layer.str.includes(`P000${searchText}`))
        ) {
          const size: number = 30 * (layer.scale ?? 1);

          const JSXElement = (
            <div
              style={{
                borderRadius: '50%',
                height: `${size}px`,
                width: `${size}px`,
                border: '3px solid',
                borderColor: purple.A700,
                position: 'relative',
                left: `-${size / 2}px`,
                top: `-${size / 2}px`,
              }}
            />
          );
          return ReactDOMServer.renderToString(JSXElement);
        }
      }
      return ReactDOMServer.renderToString(<span />);
    },
    [searchText, showSearch]
  );

  const winSize = useWindowSize();

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
    typography: {
      fontSize: 12,
    },
  });

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

  const increaseScale = () => {
    setScale((s) => {
      if (s >= 6.0) {
        return 6.0;
      }
      return s + 1;
    });
  };

  const decreaseScale = () => {
    setScale((s) => {
      if (s === 1) {
        return 1;
      }
      return s - 1;
    });
  };

  const openInBrowser = () => {
    // window.api.openInBrowser(`${snapshots[index]}`);
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSearch(false);
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

  const { locked, locked_by, fps_status } = keywords;

  React.useEffect(() => {
    if (!locked || !locked_by) return;

    if (locked.values[0] === 'T' && locked_by.values.length > 0) {
      setShowSearch(true);
      setSearchText(locked_by.values[0].toString());
    }
  }, [locked, locked_by]);

  const FoldedChip = () => {
    if (!keywords.folded || keywords.folded.values[0] === 'F') return null;
    return <Chip variant='filled' label='Folded' color='success' />;
  };

  const StatusChip = () => {
    const status_int = fps_status
      ? parseInt(fps_status.values[0], 16)
      : undefined;
    const moving = status_int !== undefined && (status_int & 2) > 0;

    const BlinkingChip = styled(Chip)({
      animation: 'blinker 1s linear infinite',
      '@keyframes blinker': {
        '0%': { opacity: 0 },
        '50%': { opacity: 0.6 },
        '100%': { opacity: 1 },
      },
    });

    if (locked && locked.values[0] === 'T') {
      return <Chip variant='filled' label='Locked' color='error' />;
    }

    if (moving) {
      return <BlinkingChip variant='filled' label='Moving' color='warning' />;
    }

    return null;
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        component='main'
        ref={divRef}
        className='snapshots'
        display='flex'
        position='absolute'
        overflow={scale === 1 ? 'hidden' : 'scroll'}
        height={winSize.height}
        width='100%'
        top={0}
      >
        <CssBaseline />
        <Box position='fixed' top='6px' zIndex={1000} width='100%'>
          <Typography
            variant='h6'
            color={grey[800]}
            fontWeight={400}
            textAlign='center'
            sx={{ userSelect: 'none' }}
          >
            {snapshots[index]
              ? snapshots[index].split('/').reverse()[0]
              : 'Snapshots'}
          </Typography>
        </Box>
        <Stack
          direction='row'
          spacing={1}
          sx={{ zIndex: 1, position: 'fixed', width: '100%' }}
          px={1}
          pt={4}
        >
          <Stack direction='row' spacing={1} sx={{ alignSelf: 'left' }}>
            <ButtonGroup variant='contained' size='small'>
              <Button
                onClick={() => setIndex((idx) => (idx === 0 ? 0 : idx - 1))}
                sx={{ padding: 0 }}
                disabled={disabledPrevious}
              >
                <NavigateBeforeIcon />
              </Button>
              <Button
                onClick={() =>
                  setIndex((idx) =>
                    idx === snapshots.length - 1 ? idx : idx + 1
                  )
                }
                sx={{ padding: 0 }}
                disabled={disabledNext}
              >
                <NavigateNextIcon />
              </Button>
            </ButtonGroup>

            <Button
              variant='contained'
              size='small'
              endIcon={<OpenInBrowserIcon />}
              onClick={openInBrowser}
            >
              Open in browser
            </Button>
          </Stack>
          <div style={{ flexGrow: 1 }} />
          <Stack direction='row' spacing={1} sx={{ alignSelf: 'right' }}>
            <StatusChip />
            <FoldedChip />
            <Button
              variant='contained'
              size='small'
              onClick={() => setScale(1)}
            >
              Fit
            </Button>
            <ButtonGroup variant='contained' size='small'>
              <Button onClick={decreaseScale}>-</Button>
              <Button onClick={increaseScale}>+</Button>
            </ButtonGroup>
            <IconButton size='small' onClick={() => setShowSearch((s) => !s)}>
              <SearchIcon sx={{ color: blue[700] }} fontSize='medium' />
            </IconButton>
            <Collapse
              in={showSearch}
              onEnter={() => inputRef.current && inputRef.current.focus()}
            >
              <OutlinedInput
                color='primary'
                size='small'
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
                sx={{
                  backgroundColor: 'white',
                  boxShadow: '2px 2px 4px black',
                  width: '100px',
                  position: 'absolute',
                  top: '45px',
                  right: '15px',
                  pr: 1,
                }}
                inputRef={inputRef}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton size='small' onClick={clearSearch}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Collapse>
          </Stack>
        </Stack>
        <PdfViewer
          file={snapshots[index]}
          width={winSize.width}
          scale={scale}
          onLoadProgress={updateButtons}
          customTextRendered={renderHighlight}
        />
      </Box>
    </ThemeProvider>
  );
}
