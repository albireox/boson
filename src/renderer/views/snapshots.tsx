/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-12-26
 *  @Filename: snapshots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { ThemeProvider } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  ButtonGroup,
  Collapse,
  createTheme,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';
import { blue, grey, purple } from '@mui/material/colors';
import React from 'react';
import { Document, Page, TextLayerItemInternal } from 'react-pdf';
import { useKeywords, useWindowSize } from 'renderer/hooks';

let host: string = window.api.store.get_sync('user.connection.httpHost');
let port: number = window.api.store.get_sync('user.connection.httpPort');

if (~host.startsWith('http')) host = 'http://' + host;

export default function SnapshotsView() {
  const keywords = useKeywords(['jaeger.configuration_snapshot', 'jaeger.snapshot'], 'snapshots');

  const [snapshots, setSnapshots] = React.useState<string[]>([]);
  const [index, setIndex] = React.useState<number>(1);

  const [scale, setScale] = React.useState<number>(1.0);
  const [disabledPrevious, setDisabledPrevious] = React.useState(true);
  const [disabledNext, setDisabledNext] = React.useState(true);

  const [showSearch, setShowSearch] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

  const inputRef = React.useRef<HTMLInputElement>(null);

  const renderHighlight = React.useCallback(
    (layer: TextLayerItemInternal) => {
      if (showSearch) {
        if (
          (searchText.length >= 4 && layer.str.includes(searchText)) ||
          (searchText.length === 3 && layer.str.includes('P0' + searchText))
        ) {
          const size: number = 30 * layer.scale!;
          return (
            <div
              style={{
                borderRadius: '50%',
                height: `${size}px`,
                width: `${size}px`,
                border: '3px solid',
                borderColor: purple.A700,
                position: 'absolute',
                left: `-${size / 2}px`,
                top: `-${size / 2}px`
              }}
            />
          );
        }
      }
      return <span />;
    },
    [showSearch, searchText]
  );

  let win_size = useWindowSize();

  const lightTheme = createTheme({
    palette: {
      mode: 'light'
    },
    typography: {
      fontSize: 12
    }
  });

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
      if (s >= 6.0) {
        return 6.0;
      } else {
        return s + 1;
      }
    });
  };

  const decreaseScale = () => {
    setScale((s) => {
      if (s === 1) {
        return 1;
      } else {
        return s - 1;
      }
    });
  };

  const openInBrowser = () => {
    window.api.openInBrowser(`${host}:${port}/${snapshots[index]}`);
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

  return (
    <ThemeProvider theme={lightTheme}>
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
            <ButtonGroup variant='contained' size='small'>
              <Button
                onClick={() => setIndex((idx) => (idx === 0 ? 0 : idx - 1))}
                sx={{ padding: 0 }}
                disabled={disabledPrevious}
              >
                <NavigateBeforeIcon />
              </Button>
              <Button
                onClick={() => setIndex((idx) => (idx === snapshots.length - 1 ? idx : idx + 1))}
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
          <Stack sx={{ flexGrow: 1, alignItems: 'center', alignSelf: 'center' }}>
            <Typography variant='subtitle1' color={grey[800]} sx={{ top: '-37px' }}>
              {snapshots[index] ? snapshots[index].split('/').reverse()[0] : ''}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1} sx={{ alignSelf: 'right' }}>
            <Button variant='contained' size='small' onClick={() => setScale(1)}>
              Fit
            </Button>
            <ButtonGroup variant='contained' size='small'>
              <Button onClick={decreaseScale}>-</Button>
              <Button onClick={increaseScale}>+</Button>
            </ButtonGroup>
          </Stack>
          <IconButton size='small' onClick={() => setShowSearch((s) => !s)}>
            <SearchIcon sx={{ color: blue[700] }} fontSize='medium' />
          </IconButton>
          <Collapse in={showSearch} onEnter={() => inputRef.current && inputRef.current.focus()}>
            <OutlinedInput
              color='secondary'
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
                pr: 1
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
        <Document
          file={`${host}:${port}/${snapshots[index]}`}
          renderMode='canvas'
          onLoadProgress={updateButtons}
        >
          <Page
            pageNumber={1}
            scale={scale}
            width={win_size.width}
            customTextRenderer={renderHighlight}
          />
        </Document>
      </div>
    </ThemeProvider>
  );
}
