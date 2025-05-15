/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-27
 *  @Filename: JS9Frame.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Stack } from '@mui/system';
import { Keyword } from 'main/tron/types';
import React from 'react';
import { useStore, useWindowSize } from 'renderer/hooks';
import GuiderContext from '../Context';
import { GuiderRefType } from '../Guider';

interface DS9DialogProps {
  open: boolean;
  close: () => void;
  message: string;
}

function DS9Dialog(props: DS9DialogProps) {
  const { open, close, message } = props;

  return (
    <Dialog open={open}>
      <DialogTitle>Failed to open in DS9</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface JS9FrameProps {
  display: string;
  filenameBundle: Keyword;
  windowFraction: number;
  showImgNum: boolean;
}

function JS9FrameInner(
  props: JS9FrameProps,
  ref: React.ForwardedRef<GuiderRefType>
) {
  const { display, filenameBundle, windowFraction, showImgNum } = props;

  const windowSize = useWindowSize();
  const [xpaset] = useStore<string>('guider.xpaset');

  const guiderConfig = React.useContext(GuiderContext);

  const [path, setPath] = React.useState<string | null>(null);
  const [size, setSize] = React.useState(800 / windowFraction);
  const [expanded, setExpanded] = React.useState(false);

  const [zoomed, setZoomed] = React.useState(false);

  const [hovering, setHovering] = React.useState(false);

  const [openDS9Dialog, setOpenDS9Dialog] = React.useState(false);
  const [DS9Message, setDS9Message] = React.useState('');

  const [host] = useStore<string>('connection.httpHost');
  const [port] = useStore<number>('connection.httpPort');

  const handleOpenInDS9 = React.useCallback(() => {
    if (!path) return;

    ['frame new', `url ${path}`].every((command) => {
      let success = true;
      window.electron.tools
        .openInApplication(`${xpaset} -p ds9 ${command}`)
        .catch((error: Error) => {
          success = false;
          setDS9Message(error.message);
          setOpenDS9Dialog(true);
        });
      return success;
    });
  }, [path, xpaset]);

  const handleZoom = React.useCallback(
    (direction: string) => {
      if (
        guiderConfig.config.selectedFrame !== '' &&
        guiderConfig.config.selectedFrame !== display
      )
        return;

      window.JS9.SetZoom(direction, { display });
      setZoomed(direction !== 'toFit');
    },
    [guiderConfig.config, display]
  );

  const handleReset = React.useCallback(() => {
    if (
      guiderConfig.config.selectedFrame !== '' &&
      guiderConfig.config.selectedFrame !== display
    )
      return;

    window.JS9.SetColormap('reset', { display });

    window.JS9.SetZoom('toFit', { display });
    setZoomed(false);

    // Recenter image.
    const imdata = window.JS9.GetImageData({ display });
    window.JS9.SetPan(imdata.width / 2, imdata.height / 2, { display });
  }, [display, guiderConfig.config]);

  React.useImperativeHandle(ref, () => ({
    name: display,
    openInDS9: handleOpenInDS9,
    zoom: handleZoom,
    reset: handleReset,
  }));

  const updateParams = React.useCallback(() => {
    if (!window.JS9) return;

    window.JS9.SetColormap(guiderConfig.config.colormap, { display });
    window.JS9.SetScale(guiderConfig.config.scale, { display });
    window.JS9.SetScale(guiderConfig.config.scalelim, { display });

    if (!zoomed) {
      window.JS9.SetZoom('toFit', { display });
    }
  }, [guiderConfig.config, display, zoomed]);

  const updateImage = React.useCallback(
    (filename: string | null) => {
      if (!filename) {
        setPath(null);
        return;
      }

      const fullURL = `http://${host}:${port}${filename}`;
      if (fullURL === path) return; // Prevent re-render if updateParams changes

      const snapURL = fullURL.replace('.fits', '-snap.fits');

      try {
        // Load URL. Wait until the image has been loaded and the update
        // the scale, colormap, etc. If the guider config changes, this
        // will be called again but the image will only be redisplayed
        // (with the new parameters), not redownloaded.
        window.JS9.cleanupFITSFile({ display });
        window.JS9.CloseImage({ display, clear: true });
        window.JS9.Load(snapURL, { onload: updateParams }, { display });
      } catch (err) {
        setPath(null);
        return;
      }



      setPath(fullURL);
    },
    [host, port, display, path, updateParams]
  );

  React.useEffect(() => {
    updateParams();
  }, [updateParams, guiderConfig.config]);

  React.useEffect(() => {
    if (!windowSize) return;

    const factor = expanded ? 2 : 1;
    setSize(Math.round(((windowSize.width || 800) / windowFraction) * factor));
  }, [windowSize, expanded]);

  React.useEffect(() => {
    setExpanded(guiderConfig.config.expandedFrame === display);
  }, [display, guiderConfig.config]);

  React.useEffect(() => {
    if (!filenameBundle || !host || !port) {
      setPath(null);
      return;
    }

    filenameBundle.values.some((fn: string) => {
      if (fn.includes(display)) {
        updateImage(fn ?? null);
        return true;
      }
      return false;
    });
  }, [filenameBundle, host, port, display, updateImage]);

  // console.log(`url ${path}`);
  // console.log(path&&showImgNum)
  // console.log(path&&showImgNum)
  let thisImgNum: string = "";
  let thisGfaNum: string = "";
  if (showImgNum && path){
    // console.log(path);
    // console.log(window);
    // console.log(path.split("-").at(-1).split(".").at(0));
    thisImgNum = path.split("-").at(-1).split(".").at(0);
    thisGfaNum = path.split("-").at(1);
    // const thisImgNum = path.split("-").at(-1).strip(".fits");
    // console.log(thisImgNum);
    // console.log(thisGfaNum);
    // window.JS9.DisplayMessage('info', thisImgNum);

  }

  return (
    <>
      {thisImgNum && <div style={{width: '100px', height: '30px', float: 'left', top: '10px', left: '10px', color: 'white', backgroundColor: 'black'}}> {thisGfaNum}: {thisImgNum} </div>}
      <Box
        className="JS9"
        id={display}
        style={{
          width: size,
          height: size,
          overflow: 'hidden',
          display:
            !expanded && guiderConfig.config.expandedFrame !== ''
              ? 'none'
              : 'block',
        }}
        sx={(theme) => ({
          border: !expanded
            ? `solid 4px ${
                guiderConfig.config.selectedFrame === display
                  ? theme.palette.info[theme.palette.mode]
                  : 'transparent'
              }`
            : undefined,

          boxSizing: 'border-box',
          'div.JS9Container > canvas.JS9Image': {
            backgroundColor: theme.palette.background.default,
            backgroundImage: path ? null : `url(/SDSS-V.png)`,
            backgroundSize: 'cover',
            backgroundBlendMode: 'luminosity',
            backgroundPosition: 'center',
            width: size,
            height: size,
          },
          '.JS9Container > .JS9Message': {
            visibility: hovering ? 'initial' : 'hidden',
          },
        })}
        data-width={`${size}px`}
        data-height={`${size}px`}
        onClick={() =>
          guiderConfig.setSelectedFrame(
            guiderConfig.config.selectedFrame === display ? '' : display
          )
        }
        onDoubleClick={() => {
          const eD = guiderConfig.config.expandedFrame !== '' ? '' : display;
          guiderConfig.setExpandedFrame(eD);
          guiderConfig.setSelectedFrame(eD);
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
      </Box>
      <DS9Dialog
        open={openDS9Dialog}
        close={() => setOpenDS9Dialog(false)}
        message={DS9Message}
      />
    </>
  );
}

const JS9Frame = React.forwardRef(JS9FrameInner);
export default JS9Frame;
