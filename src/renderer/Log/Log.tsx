/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-11
 *  @Filename: Log.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline } from '@mui/material';
import * as React from 'react';
import { Virtuoso } from 'react-virtuoso';
import Reply from '../../main/tron/reply';

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
      setReplies((old) => [...old.slice(-10000), reply.rawLine]);
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
    <Box component='main' sx={{ display: 'flex', height: '100%', p: 3 }}>
      <CssBaseline />
      {/* <Box>
        {replies.map((reply, idx) => (
          <div key={idx}>{reply}</div>
        ))}
      </Box> */}
      {/* <List
        height={1000}
        itemCount={replies.length}
        itemSize={22}
        itemData={replies}
        width={1000}
        style={{ whiteSpace: 'nowrap', flexDirection: 'row-reverse' }}
      >
        {Row}
      </List> */}
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
    </Box>
  );
};

export default Log;
