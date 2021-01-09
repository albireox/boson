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
  makeStyles,
  Theme,
  Tooltip
} from '@material-ui/core';
import { Palette } from '@material-ui/icons';
import React from 'react';

export enum Severity {
  Warning = 'warning',
  Error = 'error',
  Info = 'info',
  Success = 'success'
}

type AlertChipProps = ChipProps & { severity: Severity | string };

export function AlertChip(props: AlertChipProps) {
  const selectColour = (theme: Theme, severity?: Severity) => {
    let type: string;
    if (theme.palette.type === 'dark') {
      type = 'dark';
    } else if (theme.palette.type === 'light') {
      type = 'light';
    } else {
      type = 'main';
    }
    let sevPalette = (severity || Severity.Info) as keyof typeof Palette;
    return theme.palette[sevPalette][type];
  };

  const useStyles = makeStyles((theme) => ({
    root: {
      color: (props: AlertChipProps) =>
        selectColour(theme, props.severity as Severity),
      borderColor: (props: AlertChipProps) =>
        selectColour(theme, props.severity as Severity)
    }
  }));

  const classes = useStyles(props);
  const chipElementRef = React.useRef<HTMLInputElement>(null);
  const [hoverStatus, setHover] = React.useState(false);

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
  React.useEffect(() => {
    compareSize();
    window.addEventListener('resize', compareSize);
  }, []);

  // Remove resize listener again on "componentWillUnmount"
  React.useEffect(
    () => () => {
      window.removeEventListener('resize', compareSize);
    },
    []
  );

  return (
    <Tooltip
      arrow
      title={props.label ? props.label : ''}
      interactive
      disableHoverListener={!hoverStatus}
    >
      <div>
        <Chip ref={chipElementRef} className={classes.root} {...props} />
      </div>
    </Tooltip>
  );
}
