/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: FileNavigation.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import React from 'react';
import { BosonMenu } from 'renderer/Components';
import BosonMenuItem from 'renderer/Components/BosonMenuItem';

interface FileNavigationProps {
  files: string[];
  index: number;
  onClick?: (newIndex: number) => void;
}

export default function FileNavigation(props: FileNavigationProps) {
  const { files, index, onClick } = props;

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'snapshots',
  });

  const handleClick = React.useCallback(
    (text: unknown) => {
      let newIndex = -1;
      files.some((file, ii) => {
        if (file.includes(text as string)) {
          newIndex = ii;
          return true;
        }
        return false;
      });

      if (newIndex !== index && newIndex < files.length && onClick) {
        onClick(newIndex);
      }

      popupState.close();
    },
    [files, index, onClick, popupState]
  );

  return (
    <>
      <Box textOverflow='ellipsis' minWidth={100}>
        <Typography
          noWrap
          variant='h6'
          {...bindTrigger(popupState)}
          sx={{ WebkitAppRegion: 'no-drag', cursor: 'pointer' }}
        >
          {files[index] ? files[index].split('/').reverse()[0] : 'Snapshots'}
        </Typography>
      </Box>
      <BosonMenu {...bindMenu(popupState)}>
        {Array.from(files)
          .reverse()
          .map((file, idx) => {
            const title = file.split('/').reverse()[0];
            const selected = idx === files.length - index - 1;
            return (
              <BosonMenuItem
                key={title}
                selected={selected}
                text={title}
                textAlign='left'
                onSelect={handleClick}
              />
            );
          })}
      </BosonMenu>
    </>
  );
}
