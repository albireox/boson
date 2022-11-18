/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-15
 *  @Filename: PreferencesWrapper.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable react/jsx-props-no-spreading */

import * as React from 'react';
import IOSSwitch from 'renderer/Components/IOSwitch';
import { useStore } from 'renderer/hooks';

export interface SwitchProps {
  param: string;
}

export default function Switch(props: SwitchProps) {
  const { param } = props;

  const [value, setValue] = useStore<boolean>(param, true);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setValue(checked);
  };

  return <IOSSwitch checked={value} onChange={handleChange} />;
}
