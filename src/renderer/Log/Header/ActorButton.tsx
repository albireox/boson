/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: ActorButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { Divider } from '@mui/material';
import {
  bindHover,
  bindMenu,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import {
  CheckMenuItem,
  HeaderHoverMenu,
  HeaderIconButton,
} from 'renderer/Components';
import { useActors, useLogConfig } from '../hooks';

export default function ActorButton() {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'reply-code-menu',
  });

  const [actors] = useActors();

  const { config, toggleActor, clearActors } = useLogConfig();

  const handleClick = (_: React.MouseEvent, item: string) => {
    if (item === 'All actors') {
      clearActors();
    } else {
      toggleActor(item);
    }
  };

  return (
    <>
      <HeaderIconButton
        sx={(theme) => ({
          px: 0,
          color:
            config.actors.size === 0 ? undefined : theme.palette.text.primary,
        })}
        {...bindHover(popupState)}
        Icon={PlaylistAddIcon}
      />
      <HeaderHoverMenu {...bindMenu(popupState)}>
        <CheckMenuItem text='All actors' onClick={handleClick} noCheckbox />
        <Divider sx={{ my: '2px !important' }} />
        {Array.from(actors)
          .sort()
          .map((actor) => (
            <CheckMenuItem
              key={actor}
              text={actor}
              onClick={handleClick}
              checked={config.actors.has(actor)}
            />
          ))}
      </HeaderHoverMenu>
    </>
  );
}
