/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: LogSearchBox.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import ClearIcon from '@mui/icons-material/Clear';
import CropFreeIcon from '@mui/icons-material/CropFree';
import SearchIcon from '@mui/icons-material/Search';
import { Fade, Stack, Tooltip } from '@mui/material';
import React from 'react';
import { IconButtonFlat, SearchBox } from 'renderer/Components';
import { useLogConfig } from '../hooks';

function NoSearchIcon(props: { value: string }) {
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
}

function SearchingIcons(props: {
  value: string;
  clear: () => void;
  onShowMatchesChanged?: (mode: boolean) => void;
  onRegExChanged?: (mode: boolean) => void;
}) {
  const { value, clear, onShowMatchesChanged, onRegExChanged } = props;

  const [regEx, setRegEx] = React.useState(false);
  const [showMatches, setShowMatches] = React.useState(false);

  const handleShowMatches = () => {
    setShowMatches((current) => {
      if (onShowMatchesChanged) onShowMatchesChanged(!current);
      return !current;
    });
  };

  const handleRegEx = () => {
    setRegEx((current) => {
      if (onRegExChanged) onRegExChanged(!current);
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
}

export default function LogSearchBox() {
  const [value, setValue] = React.useState('');

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
    <SearchBox
      value={value}
      expand
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
    />
  );
}
