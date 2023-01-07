/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-26
 *  @Filename: SnapSearchBox.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import SearchBox from 'renderer/Components/SearchBox';

interface SnapSearchBoxProps {
  searchText?: string;
  onSearchChanged?: (search: string) => void;
}

export default function SnapSearchBox(props: SnapSearchBoxProps) {
  const { searchText, onSearchChanged } = props;

  return (
    <SearchBox
      sx={{
        minWidth: 100,
        maxWidth: 150,
        fontWeight: 500,
        '& .MuiInputBase-input': {
          padding: '2.5px',
        },
      }}
      placeholder='Positioner'
      value={searchText}
      onChange={(event) => {
        if (onSearchChanged) onSearchChanged(event.target.value);
      }}
      doClear={() => onSearchChanged && onSearchChanged('')}
    />
  );
}
