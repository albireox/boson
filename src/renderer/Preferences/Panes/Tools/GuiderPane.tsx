/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: GuiderPane.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Grid, Stack } from '@mui/material';
import { BosonInputBase } from 'renderer/Components';
import { useStore } from 'renderer/hooks';
import Pane from 'renderer/Preferences/Components/Pane';
import {
  TypographyDescription,
  TypographyTitle,
} from 'renderer/Preferences/Components/TypographyTitle';

function XPA() {
  const [xpaset] = useStore<number>('guider.xpaset');

  return (
    <Grid container pt={1} minHeight={50} alignContent='center' spacing={2}>
      <Grid item xs={6}>
        <TypographyTitle>Path to xpaset</TypographyTitle>
        <TypographyDescription>
          The path to xpaset use to open guider images on DS9
        </TypographyDescription>
      </Grid>
      <Grid item xs={6} alignItems='flex-end' textAlign='right' alignSelf='top'>
        <Box pt={0.5}>
          <BosonInputBase
            sx={{ px: 1.5, height: 40, width: 200 }}
            value={xpaset}
            autoCorrect='off'
            spellCheck={false}
            autoComplete='off'
            autoCapitalize='off'
            onChange={(e) =>
              window.electron.store.set('guider.xpaset', e.target.value)
            }
          />
        </Box>
      </Grid>
    </Grid>
  );
}

export default function GuiderPane() {
  return (
    <Pane title='Log Window'>
      <Grid container direction='row'>
        <Grid item xs={11}>
          <Stack width='100%' direction='column' spacing={5}>
            <XPA />
          </Stack>
        </Grid>
      </Grid>
    </Pane>
  );
}
