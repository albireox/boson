/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: connection.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Divider,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box, Stack } from '@mui/system';
import React from 'react';

/** @jsxImportSource @emotion/react */

interface IConnectionPreferences {
  observatory: string;
  program: string;
  user: string;
  host: string;
  port: string;
  httpHost: string;
  httpPort: string;
}

const Label = styled(Box)(({ theme }) => ({ textAlign: 'right' }));

export default function ConnectionPreferences(): React.ReactElement {
  const [restartNeeded, setRestartNeeded] = React.useState<boolean>(false);

  const parameters = React.useMemo(
    () => ['observatory', 'program', 'user', 'host', 'port', 'httpHost', 'httpPort'],
    []
  );

  const [values, setValues] = React.useState(
    parameters.reduce(
      (newObj, param) => ({ ...newObj, [param]: '' }),
      {}
    ) as IConnectionPreferences
  );

  React.useEffect(() => {
    // Initialise the parameters asynchronously from the store.
    Promise.all(
      parameters.map((param: string) => window.api.store.get(`user.connection.${param}`))
    ).then((vv: string[]) => {
      const result: any = {};
      for (let ii = 0; ii < parameters.length; ii++) {
        result[parameters[ii]] = vv[ii];
      }
      setValues(result);
    });
  }, [parameters]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setValues({ ...values, [name]: value });
    window.api.store.set('user.connection.' + name, value);
  };

  const handleObservatory = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setValues({ ...values, observatory: value });
    window.api.store.set('user.connection.observatory', value);
    setRestartNeeded(true);
  };

  return (
    <Grid
      container
      columns={12}
      columnSpacing={2}
      rowSpacing={1}
      minWidth='500px'
      padding={4}
      justifyContent='center'
      alignItems='center'
    >
      <Grid item xs={3}>
        <Label>
          <Typography>Observatory:</Typography>
        </Label>
      </Grid>
      <Grid item xs={9}>
        <Stack spacing={2} direction='row'>
          <Select value={values.observatory} onChange={handleObservatory} size='small'>
            <MenuItem value='APO'>APO</MenuItem>
            <MenuItem value='LCO'>LCO</MenuItem>
          </Select>
          <Label width='100%' alignSelf='center' hidden={!restartNeeded}>
            <Typography>Restart needed</Typography>
          </Label>
        </Stack>
      </Grid>

      <Grid item xs={3}>
        <Label>
          <Typography>Username:</Typography>
        </Label>
      </Grid>
      <Grid item xs={9}>
        <TextField
          name='user'
          value={values.user}
          onChange={handleChange}
          size='small'
          fullWidth
        ></TextField>
      </Grid>

      <Grid item xs={3}>
        <Label>
          <Typography>Program:</Typography>
        </Label>
      </Grid>
      <Grid item xs={9}>
        <TextField
          name='program'
          value={values.program}
          onChange={handleChange}
          size='small'
          fullWidth
        ></TextField>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ margin: 0.5 }} />
      </Grid>

      <Grid item xs={3}>
        <Label>
          <Typography>Tron host:</Typography>
        </Label>
      </Grid>
      <Grid item xs={9}>
        <TextField
          name='host'
          value={values.host}
          onChange={handleChange}
          size='small'
          fullWidth
        ></TextField>
      </Grid>

      <Grid item xs={3}>
        <Label>
          <Typography>Tron port:</Typography>
        </Label>
      </Grid>
      <Grid item xs={9}>
        <TextField
          name='port'
          value={values.port}
          onChange={handleChange}
          size='small'
          fullWidth
        ></TextField>
      </Grid>

      <Grid item xs={3}>
        <Label>
          <Typography>HTTP host:</Typography>
        </Label>
      </Grid>
      <Grid item xs={9}>
        <TextField
          name='httpHost'
          value={values.httpHost}
          onChange={handleChange}
          size='small'
          fullWidth
        ></TextField>
      </Grid>

      <Grid item xs={3}>
        <Label>
          <Typography>HTTP port:</Typography>
        </Label>
      </Grid>
      <Grid item xs={9}>
        <TextField
          name='httpPort'
          value={values.httpPort}
          onChange={handleChange}
          size='small'
          fullWidth
        ></TextField>
      </Grid>
    </Grid>
  );
}
