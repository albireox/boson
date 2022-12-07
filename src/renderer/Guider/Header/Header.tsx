/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Divider } from '@mui/material';
import Header from 'renderer/Components/BosonHeader';
import { GuiderRefMap } from '../Guider';
import ColormapButton from './ColormapButton';
import DS9Button from './DS9Button';
import ExposureNo from './ExposureNo';
import ExposureProgress from './ExposureProgress';
import ResetButton from './ResetButton';
import ScaleButton from './ScaleButton';
import ScaleLimButton from './ScaleLimButton';
import ZoomButtons from './ZoomButtons';

export interface GuiderHeaderProps {
  guiderRef: React.MutableRefObject<GuiderRefMap>;
}

export default function GuiderHeader(props: GuiderHeaderProps) {
  const { guiderRef } = props;

  return (
    <Header pr={4} spacing={3}>
      <ExposureNo />
      <ExposureProgress />
      <ZoomButtons guiderRef={guiderRef} />
      <Divider orientation='vertical' variant='middle' sx={{ height: '60%' }} />
      <ResetButton guiderRef={guiderRef} />
      <ScaleLimButton />
      <ScaleButton />
      <ColormapButton />
      <Divider orientation='vertical' variant='middle' sx={{ height: '60%' }} />
      <DS9Button guiderRef={guiderRef} />
    </Header>
  );
}
