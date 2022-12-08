/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-07
 *  @Filename: AxisOffsetInput.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Send } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React from 'react';
import { SearchBox } from 'renderer/Components';

export interface AxisOffsetInputProps {
  axis: string;
}

export default function AxisOffsetInput(params: AxisOffsetInputProps) {
  let { axis } = params;

  const [offset, setOffset] = React.useState('');
  const [error, setError] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);

  axis = axis.toLowerCase();

  if (['scale'].includes(axis)) return <div />;

  const handleClick = () => {
    if (offset === '') return;

    if (Number.isNaN(Number(offset))) {
      setError(true);
      return;
    }

    const offsetDeg = Number(offset) / 3600;

    let command: string;

    switch (axis) {
      case 'ra':
        command = `tcc offset arc ${offsetDeg}, 0.0 /computed`;
        break;
      case 'declination':
        command = `tcc offset arc 0.0, ${offsetDeg} /computed`;
        break;
      case 'rotator':
        command = `tcc offset guide 0.0, 0.0, ${offsetDeg} /computed`;
        break;
      case 'focus':
        command = `set focus=${Number(offset)} /incremental`;
        break;
      default:
        return;
    }

    setDisabled(true);

    window.electron.tron
      .send(command)
      .catch(() => setError(true))
      .finally(() => {
        setDisabled(false);
        setOffset('');
      });
  };

  return (
    <SearchBox
      error={error}
      disabled={disabled}
      endAdornment={
        <IconButton
          disabled={disabled}
          size='small'
          sx={{ opacity: 0.5 }}
          disableFocusRipple
          onClick={handleClick}
        >
          <Send fontSize='small' />
        </IconButton>
      }
      defaultWidth={150}
      placeholder=''
      value={offset}
      onChange={(e) => {
        setOffset(e.target.value);
        setError(false);
      }}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    />

    // <OutlinedInput
    //   error={error}
    //   disabled={disabled}
    //   value={offset}
    //   size='small'
    //   sx={{ minWidth: '150px', pr: '5px', py: '8px' }}
    //   onChange={(e) => {
    //     setOffset(e.target.value);
    //     setError(false);
    //   }}
    //   onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    //   endAdornment={
    //     <IconButton
    //       disabled={disabled}
    //       size='small'
    //       sx={{ opacity: 0.5 }}
    //       disableFocusRipple
    //       onClick={handleClick}
    //     >
    //       <Send fontSize='small' />
    //     </IconButton>
    //   }
    // />
  );
}
