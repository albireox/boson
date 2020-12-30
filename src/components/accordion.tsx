/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-22
 *  @Filename: accordion.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { AccordionSummary, createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexDirection: 'column-reverse',
      margin: theme.spacing(0, 2, -2.5),
      minHeight: '0px'
    },
    expandIcon: {
      padding: theme.spacing(0.1, 0, 0)
    },
    expanded: {
      margin: theme.spacing(2, 1, -1)
    }
  })
);

export function NarrowAccordionSummary(props: any) {
  const classes = useStyles();
  return (
    <AccordionSummary
      classes={{ root: classes.root, expandIcon: classes.expandIcon, expanded: classes.expanded }}
      {...props}
    />
  );
}
