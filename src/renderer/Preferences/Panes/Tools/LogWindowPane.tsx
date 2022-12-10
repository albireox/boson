/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-09
 *  @Filename: LogWindowPane.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  FormControl,
  Grid,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { BosonMenuItem, BosonSelect } from 'renderer/Components';
import { useStore } from 'renderer/hooks';
import Pane from 'renderer/Preferences/Components/Pane';

function NumberLines() {
  const [maxLogMessages] = useStore<number>('maxLogMessages');

  const values = [10000, 50000, 100000, 500000, 1000000];

  const handleChange = (e: SelectChangeEvent<unknown>) => {
    window.electron.store.set(
      'maxLogMessages',
      parseInt(e.target.value as string, 10)
    );
  };

  return (
    <Grid container pt={1} minHeight={50} alignContent='center'>
      <Grid item xs={9}>
        <Typography
          variant='body2'
          fontSize={14}
          sx={(theme) => ({
            minWidth: '150px',
            color: theme.palette.text.primary,
            userSelect: 'none',
            alignSelf: 'center',
          })}
          gutterBottom
        >
          Number of lines
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Keep this many lines in the log window. Requires an app restart.
        </Typography>
      </Grid>
      <Grid
        item
        xs={3}
        alignItems='flex-end'
        textAlign='right'
        alignSelf='center'
      >
        <FormControl>
          <BosonSelect value={maxLogMessages} onChange={handleChange}>
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

export default function LogWindowPane() {
  return (
    <Pane title='Log Window'>
      <Grid container direction='row'>
        <Grid item xs={9}>
          <Stack width='100%' direction='column' spacing={5}>
            <NumberLines />
          </Stack>
        </Grid>
      </Grid>
    </Pane>
  );
}
