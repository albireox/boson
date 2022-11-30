/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-28
 *  @Filename: DS9Button.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import Brightness5OutlinedIcon from '@mui/icons-material/Brightness5Outlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { HeaderIconButton } from 'renderer/Components';
import GuiderContext from '../Context';
import { GuiderRefMap } from '../Guider';

interface DS9DialogProps {
  open: boolean;
  close: () => void;
}

function DS9Dialog(props: DS9DialogProps) {
  const { open, close } = props;

  return (
    <Dialog open={open}>
      <DialogTitle>Frame not selected</DialogTitle>
      <DialogContent>
        <DialogContentText>Select a frame to open in DS9.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface DS9ButtonProps {
  guiderRef: React.MutableRefObject<GuiderRefMap>;
}

export default function DS9Button(props: DS9ButtonProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const guiderConfig = React.useContext(GuiderContext);
  const { guiderRef } = props;

  const handleClick = React.useCallback(() => {
    if (!guiderRef.current) return;
    if (guiderConfig.config.selectedFrame === '') {
      setOpenDialog(true);
      return;
    }

    guiderRef.current[guiderConfig.config.selectedFrame].openInDS9();
  }, [guiderConfig, guiderRef]);

  return (
    <>
      <HeaderIconButton sx={{ px: 0 }} onClick={handleClick}>
        <Tooltip title='Open in DS9'>
          <Brightness5OutlinedIcon />
        </Tooltip>
      </HeaderIconButton>
      <DS9Dialog open={openDialog} close={() => setOpenDialog(false)} />
    </>
  );
}
