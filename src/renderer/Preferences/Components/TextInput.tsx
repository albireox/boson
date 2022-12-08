/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-15
 *  @Filename: TextInput.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable react/jsx-props-no-spreading */

import {
  FormControl,
  InputBase,
  InputLabel,
  InputLabelProps,
  styled,
} from '@mui/material';
import { useStore } from 'renderer/hooks';

export const BaseTextInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(2.5),
  },
  '& .MuiInputBase-input': {
    borderRadius: '2px',
    position: 'relative',
    backgroundColor: theme.palette.mode === 'light' ? '#e3e5e8' : '#202225',
    border: null,
    fontSize: 13,
    padding: '10px 12px',
  },
}));

export const BaseInputLabel = styled(
  ({ children, ...props }: InputLabelProps) => (
    <InputLabel shrink {...props}>
      {children}
    </InputLabel>
  )
)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 13,
  color: theme.palette.text.secondary,
  '&.Mui-focused': { color: theme.palette.text.secondary },
}));

export interface TextInputProps {
  label: string;
  param: string;
  fullWidth?: boolean;
}

export default function TextInput(props: TextInputProps) {
  const { label, param, fullWidth = false } = props;
  const [value, setValue] = useStore<string>(param);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue(event.target.value);
  };

  return (
    <FormControl variant='standard' fullWidth={fullWidth}>
      <BaseInputLabel>{label.toUpperCase()}</BaseInputLabel>
      <BaseTextInput
        onChange={handleChange}
        value={value}
        fullWidth={fullWidth}
      />
    </FormControl>
  );
}
