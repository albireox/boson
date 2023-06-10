/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: SearchBox.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Fade, InputBaseProps } from '@mui/material';
import React from 'react';
import { IconButtonFlat } from 'renderer/Components';
import BosonInputBase from './BosonInputBase';

interface DefaultAddornmentProps {
  value?: string;
  doClear?: () => void;
}

function DefaultAddornment(props: DefaultAddornmentProps) {
  const { value, doClear } = props;

  return (
    <>
      <Fade appear={false} in={value === ''} timeout={{ exit: 0 }}>
        <SearchIcon
          sx={{
            fontSize: '16px',
            color: 'text.secondary',
          }}
        />
      </Fade>
      <Fade in={value !== ''} timeout={{ enter: 1500 }}>
        <Box display={value === '' ? 'none' : undefined}>
          <IconButtonFlat
            onClick={() => {
              if (doClear) doClear();
            }}
          >
            <ClearIcon
              sx={{
                fontSize: '16px',
                color: 'text.secondary',
              }}
            />
          </IconButtonFlat>
        </Box>
      </Fade>
    </>
  );
}

interface SearchBoxProps extends Omit<InputBaseProps, 'endAdornment'> {
  expand?: boolean;
  expandedWidth?: number;
  defaultWidth?: number;
  showAdornment?: boolean;
  endAdornment?: JSX.Element | null;
  doClear?: () => void;
}

export default function SearchBox(props: SearchBoxProps) {
  const {
    value,
    expand,
    doClear,
    expandedWidth,
    defaultWidth,
    endAdornment: userEndAdornment,
    showAdornment = true,
    ...rest
  } = props;

  const endAdornment = userEndAdornment ?? (
    <DefaultAddornment doClear={doClear} />
  );

  const [focused, setFocused] = React.useState(false);

  return (
    <BosonInputBase
      sx={{
        WebkitAppRegion: 'no-drag',
        fontWeight: 500,
        width:
          !expand || (!focused && !value)
            ? `${defaultWidth ?? 150}px`
            : `${expandedWidth ?? 250}px`,
        transition: 'all 0.5s ease 0s',
        '& .MuiInputBase-input': {
          padding: '2.5px',
        },
      }}
      value={value}
      placeholder='Search'
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      endAdornment={showAdornment ? endAdornment : undefined}
      {...rest}
    />
  );
}
