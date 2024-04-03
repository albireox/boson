/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-24
 *  @Filename: ActorButton.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { Divider } from '@mui/material';
import BosonIconMenu from 'renderer/Components/BosonIconMenu';
import BosonMenuItem, {
  BosonMenuItemCheckbox,
} from 'renderer/Components/BosonMenuItem';
import { HeaderIconButtonProps } from 'renderer/Components/HeaderIconButton';
import { useActors, useLogConfig } from '../hooks';

export default function ActorButton() {
  const actors = useActors();

  const { config, toggleActor, clearActors } = useLogConfig();

  const handleClick = (item: unknown) => {
    if (item === 'All actors') {
      clearActors();
    } else {
      toggleActor(item as string);
    }
  };

  const IconButtonProps: HeaderIconButtonProps = {
    sx: (theme) => ({
      px: 0,
      color: config.actors.size === 0 ? undefined : theme.palette.text.primary,
    }),
  };

  return (
    <BosonIconMenu
      name="actorButton"
      Icon={PlaylistAddIcon}
      IconButtonProps={IconButtonProps}
    >
      <BosonMenuItem text="All actors" onSelect={handleClick} />
      <Divider sx={{ my: '2px !important' }} />
      {actors.sort().map((actor) => (
        <BosonMenuItem
          key={actor}
          text={actor}
          onSelect={handleClick}
          endAdornment={
            <BosonMenuItemCheckbox checked={config.actors.has(actor)} />
          }
        />
      ))}
    </BosonIconMenu>
  );
}
