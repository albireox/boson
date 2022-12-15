/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-15
 *  @Filename: BooleanOption.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Grid } from '@mui/material';
import Switch from './Switch';
import { TypographyDescription, TypographyTitle } from './TypographyTitle';

interface BooleanOptionProps {
  title: string;
  param: string;
  description?: string;
}

export default function BooleanOption(props: BooleanOptionProps) {
  const { title, param, description } = props;

  return (
    <Grid container pt={1} minHeight={50} alignContent='center'>
      <Grid item xs={9}>
        <TypographyTitle>{title}</TypographyTitle>
        <TypographyDescription>{description}</TypographyDescription>
      </Grid>
      <Grid
        item
        xs={3}
        alignItems='flex-end'
        textAlign='right'
        alignSelf='center'
      >
        <Switch param={param} />
      </Grid>
    </Grid>
  );
}
