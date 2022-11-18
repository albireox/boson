/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-15
 *  @Filename: PasswordInput.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable react/jsx-props-no-spreading */

import { FormControl } from '@mui/material';
import React from 'react';
import { BaseInputLabel, BaseTextInput, TextInputProps } from './TextInput';

interface PasswordInputProps extends Omit<TextInputProps, 'param'> {
  account: string;
}

export default function PasswordInput(props: PasswordInputProps) {
  const { label, account, fullWidth = false } = props;

  const [value, setValue] = React.useState<string | undefined>('');

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue(event.target.value);
    if (event.target.value !== '') {
      window.electron.keytar.set(account, event.target.value ?? '');
    }
  };

  const updatePassword = React.useCallback(() => {
    window.electron.keytar
      .get(account)
      .then((pw: string | undefined) => {
        setValue(pw);
        return null;
      })
      .catch(() => {});
  }, [account]);

  React.useEffect(() => {
    updatePassword();
  }, [updatePassword]);

  return (
    <FormControl variant='standard' fullWidth={fullWidth}>
      <BaseInputLabel>{label.toUpperCase()}</BaseInputLabel>
      <BaseTextInput
        onChange={handleChange}
        value={value ?? ''}
        fullWidth={fullWidth}
        type='password'
      />
    </FormControl>
  );
}
