/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: GuiderPane.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  FormControl,
  Grid,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import {
  BosonInputBase,
  BosonMenuItem,
  BosonSelect,
} from 'renderer/Components';
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
            sx={{ px: 1.5, height: 35, width: 200 }}
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

function RefreshWindow() {
  const [refreshInterval] = useStore<number>('guider.refreshInterval');

  if (refreshInterval === undefined) {
    window.electron.store.set('guider.refreshInterval', 20);
  }

  const values = [10, 20, 30, 60];

  const handleChange = (e: SelectChangeEvent<unknown>) => {
    window.electron.store.set(
      'guider.refreshInterval',
      parseInt(e.target.value as string, 10)
    );
  };

  return (
    <Grid container pt={1} minHeight={50} alignContent='center'>
      <Grid item xs={9}>
        <TypographyTitle>Refresh time</TypographyTitle>
        <TypographyDescription>
          Refresh the guider window every N minutes to clear memory.
        </TypographyDescription>
      </Grid>
      <Grid
        item
        xs={3}
        alignItems='flex-end'
        textAlign='right'
        alignSelf='center'
      >
        <FormControl>
          <BosonSelect
            value={refreshInterval}
            onChange={handleChange}
            // sx={{ width: 125 }}
          >
            <BosonMenuItem value={0} fontVariant='body1' textAlign='right'>
              No refresh
            </BosonMenuItem>
            {values.map((value) => (
              <BosonMenuItem
                value={value}
                key={value.toString()}
                fontVariant='body1'
                textAlign='right'
              >
                {value}
              </BosonMenuItem>
            ))}
          </BosonSelect>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default function GuiderPane() {
  return (
    <Pane title='Log Window'>
      <Grid container direction='row'>
        <Grid item xs={11}>
          <Stack width='100%' direction='column' spacing={2}>
            <XPA />
            <RefreshWindow />
          </Stack>
        </Grid>
      </Grid>
    </Pane>
  );
}
