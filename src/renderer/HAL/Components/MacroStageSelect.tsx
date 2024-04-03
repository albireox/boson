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
import { useStore } from 'renderer/hooks';
import useIsMacroRunning from 'renderer/hooks/useIsMacroRunning';
import useStageStatus from 'renderer/hooks/useStageStatus';
import macros from '../macros.json';

type MacroStageSelectProps = {
  macro: keyof typeof macros;
  maxWidth?: number;
  minWidth?: number;
  onStagesSelected?: (selected: string[]) => void;
  autoMode?: boolean;
};

export function MacroStageSelect(props: MacroStageSelectProps) {
  const {
    macro,
    maxWidth = 300,
    minWidth = 300,
    autoMode = false,
    onStagesSelected,
  } = props;

  // eslint-disable-next-line prefer-destructuring
  const { stages } = macros[macro];

  const isRunning = useIsMacroRunning(macro);
  const stageStatus = useStageStatus(macro);

  const [syncStages] = useStore<boolean>('hal.syncStages');

  const [selectedStages, setSelectedStages] = React.useState<string[]>(
    autoMode ? ['auto'] : []
  );

  const handleChange = React.useCallback(
    (e: SelectChangeEvent<string[]>) => {
      const selected = e.target.value as string[];
      const lastSelected = selected[selected.length - 1];

      let newState: string[] = [];

      if (selected.length === 0) {
        newState = autoMode ? ['auto'] : [];
      } else if ((autoMode && !selected) || lastSelected === 'auto') {
        newState = ['auto'];
      } else if ((!autoMode && !selected) || lastSelected === 'all') {
        newState = [];
      } else {
        newState = selected.filter(
          (value) => value !== 'auto' && value !== 'all'
        );
      }

      setSelectedStages(newState);
      if (onStagesSelected) onStagesSelected(newState);
    },
    [onStagesSelected]
  );

  const renderValue = React.useCallback((selected: string[]) => {
    if (selected.includes('auto')) return 'Auto';
    if (selected.length === 0 || selected.includes('all')) return 'All stages';

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

  React.useEffect(() => {
    if (!isRunning || !syncStages) return;

    const currentStages = Array.from(stageStatus.status.keys());
    const userStages = currentStages.filter((stage) => stages.includes(stage));

    setSelectedStages(userStages);
  }, [stageStatus, syncStages, isRunning, stages]);

  return (
    <div>
      <FormControl sx={{ m: 1, maxWidth, minWidth }} size='small'>
        <Select
          multiple
          displayEmpty
          value={selectedStages}
          onChange={handleChange}
          disabled={isRunning}
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
          {autoMode && (
            <BosonMenuItem key='auto' text='auto' value='auto'>
              Auto
            </BosonMenuItem>
          )}
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
