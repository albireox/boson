/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { Box, Stack, Tooltip } from '@mui/material';
import { HeaderDivider, HeaderIconButton } from 'renderer/Components';
import FileNavigation from './FileNavigation';
import SnapSearchBox from './SnapSearchBox';
import SnapSlider from './SnapSlider';

interface HeaderProps {
  files: string[];
  index: number;
  searchText?: string;
  onSearchChanged?: (search: string) => void;
  onScaleChanged?: (newValue: number) => void;
  onOpenInBrowserClick?: () => void;
  onUpdateIndex?: (newIndex: number) => void;
}

export default function Header(props: HeaderProps) {
  const {
    files,
    index,
    searchText,
    onScaleChanged,
    onSearchChanged,
    onOpenInBrowserClick,
    onUpdateIndex,
  } = props;

  return (
    <Box
      height='50px'
      minHeight='50px'
      position='fixed'
      top={0}
      width='100%'
      bgcolor='background.default'
      zIndex={1000}
      sx={{ WebkitAppRegion: 'drag' }}
    >
      <Stack
        direction='row'
        alignItems='center'
        height='100%'
        spacing={2}
        pl={12}
        pr={2}
      >
        <FileNavigation files={files} index={index} onClick={onUpdateIndex} />
        <Box flexGrow={1} />
        <SnapSlider onChange={onScaleChanged} />
        <Tooltip title='Open in browser'>
          <div>
            <HeaderIconButton
              onClick={onOpenInBrowserClick}
              Icon={OpenInBrowserIcon}
            />
          </div>
        </Tooltip>
        <SnapSearchBox
          searchText={searchText}
          onSearchChanged={onSearchChanged}
        />
      </Stack>
      <HeaderDivider />
    </Box>
  );
}
