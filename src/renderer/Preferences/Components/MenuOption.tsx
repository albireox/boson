/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-14
 *  @Filename: MenuOption.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { FormControl, SelectChangeEvent } from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';
import { BosonMenuItem, BosonSelect } from 'renderer/Components';
import { useStore } from 'renderer/hooks';
import { TypographyDescription, TypographyTitle } from './TypographyTitle';

interface MenuOptionProps {
  title: string;
  option: string;
  values: string[] | number[];
  isNumber?: boolean;
  description?: string;
}

export default function MenuOption(props: MenuOptionProps) {
  const { title, option, values, isNumber = false, description } = props;

  const [currentValue] = useStore(option);

  const handleChange = (e: SelectChangeEvent<unknown>) => {
    window.electron.store.set(
      option,
      isNumber ? parseInt(e.target.value as string, 10) : e.target.value
    );
  };

  return (
    <Grid container pt={1} minHeight={50} alignContent='center'>
      <Grid xs={9}>
        <TypographyTitle>{title}</TypographyTitle>
        <TypographyDescription>{description}</TypographyDescription>
      </Grid>
      <Grid xs={3} alignItems='flex-end' textAlign='right' alignSelf='center'>
        <FormControl>
          <BosonSelect value={currentValue} onChange={handleChange}>
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
