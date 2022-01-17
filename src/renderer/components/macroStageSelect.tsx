/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-01-16
 *  @Filename: macroStageSelect.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Checkbox, Chip, FormControl, ListItemText, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

/** @jsxImportSource @emotion/react */

type MacroStageSelectProps = {
  stages: string[];
  maxWidth?: number;
  minWidth?: number;
  onStagesSelected?: (selected: string[]) => void;
};

export function MacroStageSelect({
  stages,
  maxWidth = 300,
  minWidth = 300,
  onStagesSelected
}: MacroStageSelectProps): JSX.Element {
  const [selectedStages, setSelectedStages] = React.useState<string[]>([]);

  const handleChange = (e: SelectChangeEvent<typeof selectedStages>) => {
    const selected = e.target.value as string[];
    if (selected.includes('all')) {
      setSelectedStages([]);
      if (onStagesSelected) onStagesSelected([]);
    } else {
      setSelectedStages(selected);
      if (onStagesSelected) onStagesSelected(selected);
    }
  };

  return (
    <div>
      <FormControl sx={{ m: 1, maxWidth: maxWidth, minWidth: minWidth }} size='small'>
        <Select
          multiple
          displayEmpty
          value={selectedStages}
          onChange={handleChange}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <em>All stages</em>;
            } else {
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value: string) => (
                    <Chip key={value} label={value} size='small' />
                  ))}
                </Box>
              );
            }
          }}
        >
          <MenuItem value='all'>
            <em>All stages</em>
          </MenuItem>
          {stages.map((name) => (
            <MenuItem key={name} value={name} dense={true}>
              <Checkbox checked={selectedStages.indexOf(name) > -1} size='small' />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
