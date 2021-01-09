/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-08
 *  @Filename: chip.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Chip, ChipProps, makeStyles, Theme } from '@material-ui/core';
import { Palette } from '@material-ui/icons';

type AlertChipProps = ChipProps & {
  severity: 'warning' | 'error' | 'info' | 'success';
};

export function AlertChip(props: AlertChipProps) {
  const selectColour = (theme: Theme, severity?: string) => {
    let type: string;
    if (theme.palette.type === 'dark') {
      type = 'dark';
    } else if (theme.palette.type === 'light') {
      type = 'light';
    } else {
      type = 'main';
    }
    return theme.palette[(severity || 'info') as keyof typeof Palette][type];
  };

  const useStyles = makeStyles((theme) => ({
    root: {
      color: (props: AlertChipProps) => selectColour(theme, props.severity),
      borderColor: (props: AlertChipProps) =>
        selectColour(theme, props.severity)
    }
  }));

  const classes = useStyles(props);

  return <Chip className={classes.root} {...props} />;
}
