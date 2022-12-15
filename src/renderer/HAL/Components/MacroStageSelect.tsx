/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-08
 *  @Filename: MacroStageSelect.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  ListItemText,
  MenuItem,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

type MacroStageSelectProps = {
  stages: string[];
  maxWidth?: number;
  minWidth?: number;
  onStagesSelected?: (selected: string[]) => void;
  autoMode?: boolean;
};

export function MacroStageSelect({
  stages,
  maxWidth = 300,
  minWidth = 300,
  autoMode = false,
  onStagesSelected,
}: MacroStageSelectProps): JSX.Element {
  const [selectedStages, setSelectedStages] = React.useState<string[]>([]);
  const [autoSelected, setAutoSelected] = React.useState(autoMode);

  const handleChange = React.useCallback(
    (e: SelectChangeEvent<typeof selectedStages>) => {
      const selected = e.target.value as string[];
      if (selected.includes('auto')) {
        setSelectedStages([]);
        setAutoSelected(true);
        onStagesSelected && onStagesSelected(['auto']);
      } else if (selected.includes('all')) {
        setSelectedStages([]);
        setAutoSelected(false);
        onStagesSelected && onStagesSelected([]);
      } else {
        setSelectedStages(selected);
        setAutoSelected(false);
        onStagesSelected && onStagesSelected(selected);
      }
    },
    []
  );

  React.useEffect(() => {
    // Emit the stages on load.
    onStagesSelected && onStagesSelected(autoMode ? ['auto'] : []);
  }, [onStagesSelected, autoMode]);

  return (
    <div>
      <FormControl sx={{ m: 1, maxWidth, minWidth }} size='small'>
        <Select
          multiple
          displayEmpty
          value={selectedStages}
          onChange={handleChange}
          renderValue={(selected) => {
            if (autoSelected) return 'Auto';
            if (selected.length === 0) {
              return 'All stages';
            }
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value: string) => (
                  <Chip key={value} label={value} size='small' />
                ))}
              </Box>
            );
          }}
        >
          {autoMode && <MenuItem value='auto'>Auto</MenuItem>}
          <MenuItem value='all'>All stages</MenuItem>
          {stages.map((name) => (
            <MenuItem key={name} value={name} dense>
              <Checkbox
                checked={selectedStages.indexOf(name) > -1}
                size='small'
              />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
