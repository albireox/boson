/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-20
 *  @Filename: PreferencesFormControlLabel.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

/* eslint-disable react/jsx-props-no-spreading */

import {
  FormControlLabel,
  FormControlLabelProps,
  styled,
  useRadioGroup,
} from '@mui/material';

export interface PreferencesFormControlLabelProps
  extends FormControlLabelProps {
  gutterColor?: string;
}

const StyledFormControlLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== 'gutterColor',
})<PreferencesFormControlLabelProps>(({ theme, checked, gutterColor }) => ({
  background: checked
    ? theme.palette.action.disabledBackground
    : theme.palette.background.paper,
  borderLeft: gutterColor && `2.5px solid ${gutterColor}`,
  borderTopLeftRadius: gutterColor && '3px',
  borderBottomLeftRadius: gutterColor && '3px',
}));

export default function PreferencesFormControlLabel(
  props: PreferencesFormControlLabelProps
) {
  const { value } = props;
  const radioGroup = useRadioGroup();

  return (
    <StyledFormControlLabel checked={radioGroup?.value === value} {...props} />
  );
}
