/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-21
 *  @Filename: CommandInput.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  IconButton,
  IconButtonProps,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  MenuProps,
  OutlinedInput,
  styled,
} from '@mui/material';
import React from 'react';
import { ViewportRefType } from '.';

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

interface HistoryMenuProps extends MenuProps {
  commands: string[];
  itemOnClick?: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
}

function HistoryMenu(props: HistoryMenuProps) {
  const { commands, itemOnClick, ...rest } = props;
  return (
    <Menu {...rest}>
      <MenuList dense>
        {commands.length > 1 ? (
          commands.map((command, index) => {
            if (command === '') return null;
            return (
              <MenuItem
                data-command={command}
                key={`history-menu-item-${index}`}
                onClick={itemOnClick}
              >
                <ListItemText>{command}</ListItemText>
              </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled key='no-commands'>
            <ListItemText>No commands</ListItemText>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
}

interface CommandInputProps {
  viewportRef?: React.RefObject<ViewportRefType>;
}

export default function CommandInput(props: CommandInputProps) {
  const { viewportRef } = props;

  const [value, setValue] = React.useState('');

  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [history, setHistory] = React.useState<string[]>(['']);

  const HISTORY_MENU_N = 10;

  const textRef = React.useRef<HTMLInputElement>(null);

  const [historyMenuAnchor, setHistoryMenuAnchor] =
    React.useState<null | HTMLElement>(null);

  const open = Boolean(historyMenuAnchor);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHistoryMenuAnchor(event.currentTarget);
  };

  const closeHistoryMenu = React.useCallback(() => {
    setHistoryMenuAnchor(null);
  }, []);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    []
  );

  const sendCommand = React.useCallback(
    (command: string) => {
      if (history[1] !== command) {
        setHistory((current) => [current[0], command, ...current.slice(1)]);
      }
      window.electron.tron.send(command).catch(() => {});
      setValue('');
      setHistoryIndex(0);
    },
    [history]
  );

  const handleCommand = React.useCallback(() => {
    if (value.trim().length > 0) {
      sendCommand(value);
    } else {
      viewportRef?.current?.gotoBottom();
    }
  }, [value, sendCommand, viewportRef]);

  const handleKeyPress = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleCommand();
      } else if (event.key === 'ArrowUp') {
        const newIndex = historyIndex + 1;
        if (history.length >= newIndex + 1) {
          setValue(history[newIndex]);
          setHistoryIndex(newIndex);
        }
      } else if (event.key === 'ArrowDown') {
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setValue(history[newIndex]);
          setHistoryIndex(newIndex);
        }
      }
      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && textRef) {
        setTimeout(() => {
          const selection = textRef.current?.value.length ?? 0;
          textRef.current?.setSelectionRange(selection, selection);
        }, 10);
      }
    },
    [handleCommand, history, historyIndex]
  );

  const handleMenuClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    closeHistoryMenu();
    const { command } = event.currentTarget.dataset;
    if (command && command !== '') sendCommand(command);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <OutlinedInput
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        sx={(theme) => ({
          height: 40,
          backgroundColor: theme.palette.action.boxBackground,
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        })}
        value={value}
        fullWidth
        margin='none'
        autoFocus
        inputRef={textRef}
        placeholder='Send command to tron'
        spellCheck={false}
        startAdornment={
          <InputAdornment position='start'>
            <AdornmentIconButton onClick={handleClick}>
              <AddCircleRoundedIcon />
            </AdornmentIconButton>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position='end'>
            <AdornmentIconButton
              onClick={handleCommand}
              onMouseDown={handleCommand}
            >
              <SendIcon />
            </AdornmentIconButton>
          </InputAdornment>
        }
      />
      <HistoryMenu
        open={open}
        anchorEl={historyMenuAnchor}
        onClose={closeHistoryMenu}
        itemOnClick={handleMenuClick}
        commands={history.slice(-(HISTORY_MENU_N + 1)).reverse()}
      />
    </Box>
  );
}
