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
      placeholder='Positioner'
      value={searchText}
      onChange={(event) => {
        onSearchChanged && onSearchChanged(event.target.value);
      }}
      doClear={() => onSearchChanged && onSearchChanged('')}
    />
  );
}