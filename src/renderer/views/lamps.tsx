/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-08-16
 *  @Filename: lamps.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Stack, Switch, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useKeywords } from 'renderer/hooks';

/** @jsxImportSource @emotion/react */

function Lamp({ name }: { name: string }) {
  const keywords = useKeywords([`lamps.${name.toLowerCase()}`]);
  const lamp = keywords[`lamps.${name.toLowerCase()}`];

  const [isOn, setOn] = useState<boolean>(false);
  const [colour, setColour] = useState<any>('default');

  React.useEffect(() => {
    if (!lamp || !lamp.values) return;

    setOn(lamp.values[0] === 'ON' || lamp.values[0] === 'WARMING' ? true : false);

    if (lamp.values[0] === 'ON') {
      setColour('primary');
    } else if (lamp.values[0] === 'WARMING') {
      setColour('warning');
    } else {
      setColour('default');
    }
  }, [lamp]);

  const handleLamp = (event: React.ChangeEvent<HTMLInputElement>) => {
    const verb = event.target.checked ? 'on' : 'off';
    window.api.tron.send(`lamps ${verb} ${name}`, true).catch(() => setColour('secondary'));
  };

  return (
    <Stack direction='row' spacing={0.5} width='100%' alignItems={'center'}>
      <LightbulbIcon color={colour} fontSize='large' />
      <Switch checked={isOn} color={colour} onChange={handleLamp} />
      <Typography marginLeft={1} alignSelf='center' color={colour}>
        {name}
      </Typography>
    </Stack>
  );
}

export default function LampsView() {
  const lamps = ['SQM', 'FF', 'Laser', 'HgAr', 'Ne'];

  return (
    <Stack direction='column' width={100} padding={2} spacing={1}>
      {lamps.map((l) => (
        <Lamp name={l} key={l} />
      ))}
    </Stack>
  );
}
