/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-01-16
 *  @Filename: apogee-dome-flat.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SendIcon from '@mui/icons-material/Send';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { CommandButton } from 'renderer/Components';
import CommandWrapper from 'renderer/Components/CommandWrapper';
import useIsMacroRunning from 'renderer/hooks/useIsMacroRunning';
import MacroPaper from './Components/MacroPaper';
import { MacroStageSelect } from './Components/MacroStageSelect';
import MacroStepper from './Components/MacroStepper';

export default function ApogeeDomeFlat() {
  const macroName = 'apogee_dome_flat';

  const isRunning = useIsMacroRunning(macroName);

  return (
    <MacroPaper backcolor='#FF980030'>
      <Stack
        direction='column'
        divider={<Divider variant='middle' sx={{ opacity: 0.8 }} />}
        width='100%'
        p={1}
        px={2}
        spacing={1}
      >
        <Stack alignItems='center' direction='row' spacing={2}>
          <Typography variant='h6' whiteSpace='nowrap'>
            APOGEE Dome Flat
          </Typography>
          <MacroStageSelect macro={macroName} maxWidth={300} minWidth={100} />
          <Box flexGrow={1} />
          <CommandWrapper
            commandString='hal calibrations apogee-dome-flat'
            abortCommand='hal calibrations apogee-dome-flat --stop'
            isRunning={isRunning}
          >
            <CommandButton variant='outlined' endIcon={<SendIcon />}>
              Run
            </CommandButton>
          </CommandWrapper>
        </Stack>
        <Stack
          alignItems='center'
          direction='row'
          spacing={2}
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
          }}
        >
          <MacroStepper macroName={macroName} />
        </Stack>
      </Stack>
    </MacroPaper>
  );
}
