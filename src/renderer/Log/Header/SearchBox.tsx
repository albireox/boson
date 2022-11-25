/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: SearchBox.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import ClearIcon from '@mui/icons-material/Clear';
import CropFreeIcon from '@mui/icons-material/CropFree';
import SearchIcon from '@mui/icons-material/Search';
import { Fade, InputBase, InputBaseProps, Stack, Tooltip } from '@mui/material';
import React from 'react';
import { IconButtonFlat } from 'renderer/Components';
import { useLogConfig } from '../hooks';

const NoSearchIcon = (props: { value: string }) => {
  const { value } = props;

  return (
    <Fade appear={false} in={value === ''} timeout={{ exit: 0 }}>
      <SearchIcon
        sx={{
          fontSize: '16px',
          color: 'text.secondary',
        }}
      />
    </Fade>
  );
};

const SearchingIcons = (props: {
  value: string;
  clear: () => void;
  onShowMatchesChanged?: (mode: boolean) => void;
  onRegExChanged?: (mode: boolean) => void;
}) => {
  const { value, clear, onShowMatchesChanged, onRegExChanged } = props;

  const [regEx, setRegEx] = React.useState(false);
  const [showMatches, setShowMatches] = React.useState(false);

  const handleShowMatches = () => {
    setShowMatches((current) => {
      onShowMatchesChanged && onShowMatchesChanged(!current);
      return !current;
    });
  };

  const handleRegEx = () => {
    setRegEx((current) => {
      onRegExChanged && onRegExChanged(!current);
      return !current;
    });
  };

  return (
    <Fade in={value !== ''} timeout={{ enter: 1500 }}>
      {/* See https://stackoverflow.com/a/63535710 */}
      <Stack
        direction='row'
        spacing={1}
        display={value === '' ? 'none' : undefined}
      >
        <IconButtonFlat onClick={clear}>
          <ClearIcon
            sx={{
              fontSize: '16px',
              color: 'text.secondary',
            }}
          />
        </IconButtonFlat>

        <IconButtonFlat onClick={handleShowMatches}>
          <Tooltip title='Show matches only'>
            <CropFreeIcon
              sx={{
                fontSize: '16px',
                color: showMatches ? 'text.primary' : 'text.secondary',
              }}
            />
          </Tooltip>
        </IconButtonFlat>

        <IconButtonFlat onClick={handleRegEx}>
          <Tooltip title='Use regex'>
            <AutoFixNormalIcon
              sx={{
                fontSize: '16px',
                color: regEx ? 'text.primary' : 'text.secondary',
              }}
            />
          </Tooltip>
        </IconButtonFlat>
      </Stack>
    </Fade>
  );
};

export default function SearchBox(props: InputBaseProps) {
  const [value, setValue] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  const { config, setSearchText, setShowMatched, setUseRegEx } = useLogConfig();

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setValue(event.target.value);
  };

  React.useEffect(() => {
    if (value === '' && config.searchText) {
      setSearchText('');
    }
  }, [value, config, setSearchText]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        setSearchText(value);
      }
    },
    [value, setSearchText]
  );

  const handleShowMatches = React.useCallback(
    (mode: boolean) => {
      setShowMatched(mode);
      setSearchText(value);
    },
    [setSearchText, setShowMatched, value]
  );

  const handleRegEx = React.useCallback(
    (mode: boolean) => {
      setUseRegEx(mode);
      setSearchText(value);
    },
    [setSearchText, setUseRegEx, value]
  );

  return (
    <InputBase
      sx={(theme) => ({
        borderRadius: '4px',
        position: 'relative',
        backgroundColor: theme.palette.mode === 'light' ? '#E3E5E8' : '#202225',
        color: theme.palette.action.active,
        border: 'none',
        padding: '0px 6px',
        fontWeight: 500,
        transition: 'all 0.5s ease 0s',
        width: !focused && !value ? '150px' : '250px',
        '& .MuiInputBase-input': {
          padding: '2.5px',
        },
      })}
      value={value}
      placeholder='Search'
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      endAdornment={
        <>
          <NoSearchIcon value={value} />
          <SearchingIcons
            value={value}
            clear={() => setValue('')}
            onShowMatchesChanged={handleShowMatches}
            onRegExChanged={handleRegEx}
          />
        </>
      }
      {...props}
    />
  );
}
