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

const StyledFormControlLabel = styled(FormControlLabel)(
  ({ theme, checked }) => ({
    background: checked
      ? theme.palette.action.disabledBackground
      : theme.palette.background.paper,
  })
);

export default function PreferencesFormControlLabel(
  props: FormControlLabelProps
) {
  const { value } = props;
  const radioGroup = useRadioGroup();

  return (
    <StyledFormControlLabel checked={radioGroup?.value === value} {...props} />
  );
}
