/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-01-14
 *  @Filename: ColumnReverseViewport.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, useTheme } from '@mui/material';
import Reply from 'main/tron/reply';
import { useLogConfig } from '../hooks';
import Message from './Message';

interface ColumnReverseViewportProps {
  data: Reply[];
}

export default function ColumnReverseViewport(
  props: ColumnReverseViewportProps
) {
  const { data } = props;

  const theme = useTheme();
  const { config } = useLogConfig();

  return (
    <Box
      component='div'
      width='100%'
      flexGrow={1}
      flexDirection='column-reverse'
      display='flex'
      overflow='scroll'
    >
      {data
        .slice(0)
        .reverse()
        .map((reply, index) => (
          <Message
            key={index}
            reply={reply}
            theme={theme}
            searchText={config.searchText}
            searchUseRegEx={config.searchUseRegEx}
            wrap={config.wrap}
          />
        ))}
    </Box>
  );
}
