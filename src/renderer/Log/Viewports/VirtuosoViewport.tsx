/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-14
 *  @Filename: VirtuosoViewport.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useTheme } from '@mui/material';
import Reply from 'main/tron/reply';
import React from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useLogConfig } from '../hooks';
import Message from './Message';

interface VirtuosoViewportProps {
  data: Reply[];
  onIsScrolling?: (scrolling: boolean) => void;
  onIsAtBottomState?: (atBottom: boolean) => void;
}

function VirtuosoViewportInner(
  props: VirtuosoViewportProps,
  ref: React.ForwardedRef<VirtuosoHandle>
) {
  const { data, onIsScrolling, onIsAtBottomState } = props;

  const theme = useTheme();
  const { config } = useLogConfig();

  return (
    <Virtuoso
      ref={ref}
      style={{
        height: '100%',
        width: '100%',
        overflowX: 'auto',
        overflowY: 'auto',
      }}
      totalCount={data.length}
      data={data}
      overscan={1000}
      itemContent={(index) => (
        <Message
          reply={data[index]}
          theme={theme}
          searchText={config.searchText}
          searchUseRegEx={config.searchUseRegEx}
          wrap={config.wrap}
        />
      )}
      followOutput='auto'
      alignToBottom
      atBottomThreshold={100}
      increaseViewportBy={400}
      isScrolling={onIsScrolling}
      atBottomStateChange={onIsAtBottomState}
    />
  );
}

const VirtuosoViewport = React.forwardRef(VirtuosoViewportInner);
export default VirtuosoViewport;
