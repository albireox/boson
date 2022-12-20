/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-21
 *  @Filename: Input.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  IconButton,
  IconButtonProps,
  InputAdornment,
  OutlinedInput,
  Popover,
  styled,
} from '@mui/material';
import React from 'react';

const AdornmentIconButton = styled((props: IconButtonProps) => (
  <IconButton
    disableFocusRipple
    disableRipple
    disableTouchRipple
    size='small'
    {...props}
  />
))(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': { color: theme.palette.text.primary },
}));

type EmojiType = { native: string };

export default function Input() {
  const [value, setValue] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);

    const { current } = inputRef;
    if (!current) return;

    inputRef.current?.focus();
    const [, end] = [current.selectionStart, current.selectionEnd];

    setTimeout(() => {
      const selection = (end ?? 0) + 1;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(selection, selection);
    }, 100);
  };

  const sendCommand = React.useCallback(() => {
    window.electron.tron.send(`msg ${value}`).catch(() => {});
    setValue('');
  }, [value]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    []
  );

  const handleEmoji = React.useCallback(
    (emoji: EmojiType) => {
      const { current } = inputRef;
      if (emoji && current) {
        current.focus();
        const [start, end] = [current.selectionStart, current.selectionEnd];
        setValue(
          value.substring(0, start ?? 0) +
            emoji.native +
            value.substring(end ?? 0)
        );
      }
      handleClose();
    },
    [value]
  );

  return (
    <Box display='flex' flexDirection='row' px={2} pb={2}>
      <OutlinedInput
        onChange={handleChange}
        onKeyDown={(event) => event.key === 'Enter' && sendCommand()}
        sx={(theme) => ({
          height: '40px',
          backgroundColor: theme.palette.action.boxBackground,
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        })}
        value={value}
        inputRef={inputRef}
        fullWidth
        margin='none'
        autoFocus
        placeholder='Message'
        startAdornment={
          <InputAdornment position='start'>
            <AdornmentIconButton onClick={handleOpen}>
              <EmojiEmotionsIcon />
            </AdornmentIconButton>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position='end'>
            <AdornmentIconButton
              onClick={sendCommand}
              onMouseDown={sendCommand}
            >
              <SendIcon />
            </AdornmentIconButton>
          </InputAdornment>
        }
      />
      <Popover
        PaperProps={{ sx: { backgroundImage: 'unset' } }}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Picker data={data} onEmojiSelect={handleEmoji} />
      </Popover>
    </Box>
  );
}
