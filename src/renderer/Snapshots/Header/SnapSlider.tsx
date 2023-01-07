/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: SnapSlider.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Slider, SliderProps, Tooltip } from '@mui/material';

interface SnapSliderProps extends Omit<SliderProps, 'onChange'> {
  onChange?: (newValue: number) => void;
}

export default function SnapSlider(props: SnapSliderProps) {
  const { onChange, ...rest } = props;

  return (
    <Tooltip title='Scale'>
      <Box pl={2} pr={4} sx={{ WebkitAppRegion: 'no-drag' }}>
        <Slider
          sx={(theme) => ({
            top: '3px',
            width: 150,
            color: theme.palette.text.secondary,
            boxShadow: 'none',
            '& .MuiSlider-thumb': {
              color: theme.palette.text.primary,
              '& .Mui-focusVisible': {
                boxShadow: 'none',
              },
              ':hover': {
                boxShadow: 'none',
              },
            },
          })}
          onChange={(event, newValue) => {
            if (onChange)
              onChange(Array.isArray(newValue) ? newValue[0] : newValue);
          }}
          defaultValue={1}
          valueLabelDisplay='off'
          min={1}
          max={6}
          step={1}
          marks
          {...rest}
        />
      </Box>
    </Tooltip>
  );
}
