/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-08
 *  @Filename: chip.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Chip,
  ChipProps,
  PaletteColor,
  styled,
  Theme,
  Tooltip
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export enum Severity {
  Warning = 'warning',
  Error = 'error',
  Info = 'info',
  Success = 'success'
}

type AlertChipProps = ChipProps & { severity: Severity | string };

export function AlertChip(props: AlertChipProps) {
  const selectColour = (theme: Theme, severity?: Severity) => {
    let mode: keyof PaletteColor;
    if (theme.palette.mode === 'dark') {
      mode = 'dark';
    } else if (theme.palette.mode === 'light') {
      mode = 'light';
    } else {
      mode = 'main';
    }
    let sevPalette = severity || Severity.Info;
    return theme.palette[sevPalette][mode];
  };

  const chipElementRef = useRef<HTMLInputElement>(null);
  const [hoverStatus, setHover] = useState(false);

  // Enable the tooltip but only in cases in which the chip contains ellipses
  // (the text is longer that the allowed width). See https://bit.ly/35o4w3L
  // We need to use the first child of the reference because Chip creates a
  // <span /> with the text as the first element.
  const compareSize = () => {
    let compare: boolean;
    if (chipElementRef.current) {
      compare =
        chipElementRef.current.children[0].scrollWidth >
        chipElementRef.current.children[0].clientWidth;
    } else {
      compare = false;
    }
    setHover(compare);
  };

  // Compare once and add resize listener on "componentDidMount"
  useEffect(() => {
    compareSize();
    window.addEventListener('resize', compareSize);
  }, []);

  // Remove resize listener again on "componentWillUnmount"
  useEffect(
    () => () => {
      window.removeEventListener('resize', compareSize);
    },
    []
  );

  const StyledChip = styled(Chip, {
    shouldForwardProp: (props) => true
  })<AlertChipProps>(({ theme, severity }) => ({
    color: selectColour(theme, severity as Severity),
    borderColor: selectColour(theme, severity as Severity)
  }));

  if (props.label === undefined || props.label === null) {
    return <span />;
  } else {
    return (
      <Tooltip
        arrow
        title={props.label ? props.label : ''}
        disableHoverListener={!hoverStatus}
      >
        <div>
          <StyledChip ref={chipElementRef} {...props} />
        </div>
      </Tooltip>
    );
  }
}
