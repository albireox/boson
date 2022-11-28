/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { Box, Tooltip } from '@mui/material';
import { BosonHeader, HeaderIconButton } from 'renderer/Components';
import FileNavigation from './FileNavigation';
import SnapSearchBox from './SnapSearchBox';
import SnapSlider from './SnapSlider';

interface SnapHeaderProps {
  files: string[];
  index: number;
  searchText?: string;
  onSearchChanged?: (search: string) => void;
  onScaleChanged?: (newValue: number) => void;
  onOpenInBrowserClick?: () => void;
  onUpdateIndex?: (newIndex: number) => void;
}

export default function SnapHeader(props: SnapHeaderProps) {
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
    <BosonHeader>
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
    </BosonHeader>
  );
}
