/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-11
 *  @Filename: Log.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline } from '@mui/material';
import { Stack } from '@mui/system';
import * as React from 'react';
import { Virtuoso } from 'react-virtuoso';
import Reply from '../../main/tron/reply';
import CommandInput from './CommandInput';

const Row = ({
  data,
  index,
  style,
}: {
  data: string[];
  index: number;
  style: React.CSSProperties;
}) => {
  return <div style={style}>{data[index]}</div>;
};

const Log = () => {
  const [replies, setReplies] = React.useState<string[]>([]);

  React.useEffect(() => {
    const test = (reply: Reply) => {
      setReplies((old) => [...old, reply.rawLine]);
    };

    window.electron.ipcRenderer.on('tron:received-reply', test);
    window.electron.tron.subscribe();

    const unload = () => {
      window.electron.ipcRenderer.removeListener('tron:received-reply', test);
      window.electron.tron.unsubscribe();
    };

    window.addEventListener('unload', unload);

    return () => {
      unload();
    };
  }, []);

  return (
    <Box
      component='main'
      sx={{
        display: 'flex',
        position: 'absolute',
        height: '100%',
        p: 3,
      }}
      width='100%'
      position='absolute'
      top={0}
    >
      <CssBaseline />
      <Stack height='100%' direction='column' pt={2} spacing={2}>
        <Virtuoso
          style={{
            height: '100%',
            width: '100%',
          }}
          totalCount={replies.length}
          data={replies}
          overscan={1000}
          itemContent={(index) => (
            <div style={{ whiteSpace: 'nowrap' }}>{replies[index]}</div>
          )}
          followOutput='smooth'
          alignToBottom
          atBottomThreshold={400}
          defaultItemHeight={22}
        />
        <CommandInput />
      </Stack>
    </Box>
  );
};

export default Log;
