/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-07
 *  @Filename: PreloadedBanner.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import ClearIcon from '@mui/icons-material/Clear';
import { Button, Collapse, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import BosonHeader from 'renderer/Components/BosonHeader';
import { useIsExposing, useKeywordContext } from 'renderer/hooks';
import SnackAlert, { SnackAlertRefType } from '../Components/SnackAlert';

function loadDesign() {
  window.electron.tron.send('jaeger configuration load --from-preloaded');
}

export function PreloadedBanner() {
  const {
    'jaeger.design_preloaded': designPreloadedKw,
    'jaeger.preloaded_is_cloned': preloadedIsClonedKw,
  } = useKeywordContext();

  const [preloadedDesignID, setPreloadedDesignID] = React.useState<number>(0);
  const [isCloned, setIsCloned] = React.useState(false);

  const exposing = useIsExposing();

  const preloadAlertRef = React.useRef<SnackAlertRefType>(null);

  React.useEffect(() => {
    if (!designPreloadedKw) return;
    setPreloadedDesignID(designPreloadedKw.values[0]);
  }, [designPreloadedKw]);

  React.useEffect(() => {
    if (!preloadedIsClonedKw) return;
    setIsCloned(preloadedIsClonedKw.values[0]);
  }, [preloadedIsClonedKw]);

  const checkAndLoad = React.useCallback(() => {
    if (exposing) {
      preloadAlertRef.current?.open();
      return;
    }
    loadDesign();
  }, [exposing]);

  const clearDesign = React.useCallback(() => {
    window.electron.tron.send('jaeger configuration preload --clear');
  }, []);

  return (
    <>
      <Collapse in={preloadedDesignID > 0}>
        <BosonHeader>
          <Stack
            direction='row'
            width='100%'
            sx={{ opacity: preloadedDesignID > 0 ? 1 : 0 }}
          >
            <Typography
              fontSize={16}
              fontWeight={400}
              textAlign='center'
              alignSelf='center'
              color='text.primary'
              flexGrow={1}
            >
              Design {preloadedDesignID}
              {isCloned && ' (CLONED)'} has been preloaded.
            </Typography>
            <Button
              variant='outlined'
              size='small'
              sx={(theme) => ({
                '&.MuiButton-root': {
                  color: 'text.secondary',
                  border: `1px solid ${theme.palette.text.secondary}`,
                },
              })}
              onClick={checkAndLoad}
            >
              Load
            </Button>
            <IconButton
              sx={{ ml: 1 }}
              size='small'
              disableRipple
              onClick={clearDesign}
            >
              <ClearIcon fontSize='inherit' />
            </IconButton>
          </Stack>
        </BosonHeader>
      </Collapse>
      <SnackAlert
        ref={preloadAlertRef}
        message='An exposure is running'
        actionText='LOAD'
        action={loadDesign}
      />
    </>
  );
}
