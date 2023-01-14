/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-08
 *  @Filename: MacroStageSelect.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Chip, Divider, FormControl } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';
import BosonMenuItem, {
  BosonMenuItemCheckbox,
} from 'renderer/Components/BosonMenuItem';

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

  const handleChange = React.useCallback(
    (e: SelectChangeEvent<string[]>) => {
      const selected = e.target.value as string[];
      if (selected.includes('auto')) {
        setSelectedStages([]);
        if (onStagesSelected) onStagesSelected(['auto']);
      } else if (selected.includes('all')) {
        setSelectedStages([]);
        if (onStagesSelected) onStagesSelected([]);
      } else {
        setSelectedStages(selected);
        if (onStagesSelected) onStagesSelected(selected);
      }
    },
    [onStagesSelected]
  );

  const renderValue = React.useCallback((selected: string[]) => {
    if (selected.includes('auto')) return 'Auto';
    if (selected.length === 0) return 'All stages';

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((value: string) => (
          <Chip key={value} label={value} size='small' />
        ))}
      </Box>
    );
  }, []);

  React.useEffect(() => {
    // Emit the stages on load.
    if (onStagesSelected) onStagesSelected(autoMode ? ['auto'] : []);
  }, [onStagesSelected, autoMode]);

  return (
    <div>
      <FormControl sx={{ m: 1, maxWidth, minWidth }} size='small'>
        <Select
          multiple
          displayEmpty
          value={selectedStages}
          onChange={handleChange}
          MenuProps={{
            PaperProps: {
              elevation: 0,
              sx: (theme) => ({
                backgroundColor:
                  theme.palette.mode === 'dark' ? '#18191C' : '#fff',
                px: 0.25,
                py: 0,
              }),
            },
          }}
          renderValue={renderValue}
        >
          {autoMode && <BosonMenuItem value='auto'>Auto</BosonMenuItem>}
          <BosonMenuItem value='all'>All stages</BosonMenuItem>
          <Divider sx={{ my: '2px !important' }} />
          {stages.map((name) => (
            <BosonMenuItem
              key={name}
              text={name}
              value={name}
              showBackground={false}
              endAdornment={
                <BosonMenuItemCheckbox
                  checked={selectedStages.indexOf(name) > -1}
                />
              }
            />
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
