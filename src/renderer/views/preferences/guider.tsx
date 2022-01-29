/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-10-09
 *  @Filename: other.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  styled,
  TextField,
  Typography
} from '@mui/material';
import React from 'react';

/** @jsxImportSource @emotion/react */

const Label = styled(Box)({ textAlign: 'right' });

const cmaps = ['Grey', 'Heat', 'Cool', 'Viridis', 'Magma', 'Red', 'Green', 'Blue'];
const scales = ['linear', 'log', 'histeq', 'power', 'sqrt', 'squared', 'asinh', 'sinh'];
const scalelims = ['dataminmax', 'zscale'];

export default function GuiderPreferences(): React.ReactElement {
  const handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    window.api.store.set('user.guider.' + name, value);
  };

  return (
    <Grid
      container
      columns={12}
      columnSpacing={2}
      rowSpacing={1}
      minWidth='500px'
      minHeight='200px'
      padding={4}
      justifyContent='center'
      alignItems='center'
    >
      <Grid item xs={4}>
        <Label>
          <Typography>Username:</Typography>
        </Label>
      </Grid>
      <Grid item xs={8}>
        <TextField
          name='xpaset'
          defaultValue={window.api.store.get_sync('user.guider.xpaset')}
          onChange={handleChange}
          size='small'
          fullWidth
        />
      </Grid>

      <Grid item xs={4}>
        <Label>
          <Typography>Display full image:</Typography>
        </Label>
      </Grid>
      <Grid item xs={8}>
        <Select
          defaultValue={window.api.store.get_sync('user.guider.fullImage')}
          name='fullImage'
          onChange={handleChange}
          size='small'
        >
          <MenuItem value='true'>True</MenuItem>
          <MenuItem value='false'>False</MenuItem>
        </Select>
      </Grid>

      <Grid item xs={4}>
        <Label>
          <Typography>Colormap:</Typography>
        </Label>
      </Grid>
      <Grid item xs={8}>
        <FormControl size='small'>
          <Select
            defaultValue={window.api.store.get_sync('user.guider.colormap')}
            onChange={handleChange}
            size='small'
            name='colormap'
          >
            {cmaps.map((_cmap) => {
              return (
                <MenuItem key={_cmap} value={_cmap.toLowerCase()}>
                  <img
                    alt={_cmap}
                    style={{ marginRight: '4px' }}
                    src={
                      process.env.PUBLIC_URL +
                      `/js9/images/toolbar/dax_images/cmap_${_cmap.toLowerCase()}.png`
                    }
                  />
                  {_cmap}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={4}>
        <Label>
          <Typography>Scale:</Typography>
        </Label>
      </Grid>
      <Grid item xs={8}>
        <FormControl size='small'>
          <Select
            defaultValue={window.api.store.get_sync('user.guider.scale')}
            onChange={handleChange}
            size='small'
            name='scale'
          >
            {scales.map((_scale) => {
              return (
                <MenuItem key={_scale} value={_scale.toLowerCase()}>
                  {_scale}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={4}>
        <Label>
          <Typography>Scale clipping:</Typography>
        </Label>
      </Grid>
      <Grid item xs={8}>
        <FormControl size='small'>
          <Select
            defaultValue={window.api.store.get_sync('user.guider.scalelim')}
            onChange={handleChange}
            size='small'
            name='scalelim'
          >
            {scalelims.map((_scalelim) => {
              return (
                <MenuItem key={_scalelim} value={_scalelim.toLowerCase()}>
                  {_scalelim}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
