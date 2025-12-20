import React from 'react';
import Button from '@mui/material/Button';
import { CssBaseline, Box, Stack } from '@mui/material';
import { useKeywordContext } from 'renderer/hooks';

export function DesignInput() {
    const keywords = useKeywordContext();
    const { configuration_loaded: configurationLoaded } = keywords.state;

    const[Az, setAzID ] = React.useState<string>('0:00:00.00');
    const [Alt, setAltID ] = React.useState<string>('0:00:00.00');
    const [Rot, setRotID ] = React.useState<string>('0.00');



} 