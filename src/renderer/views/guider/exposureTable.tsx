/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-09-30
 *  @Filename: exposureTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Keyword, KeywordMap } from 'main/tron';
import React from 'react';

/** @jsxImportSource @emotion/react */

export const ExposureTable: React.FC<{ keywords: KeywordMap }> = ({
  keywords
}) => {
  const [files, setFiles] = React.useState<Keyword[]>([]);

  React.useEffect(() => {
    if (!keywords || !keywords['fliswarm.filename']) return;
    let value = keywords['fliswarm.filename'].values;
    console.log(value);
    setFiles((f) => [keywords['fliswarm.filename'], ...f]);
  }, [keywords]);
  let i = 0;
  return (
    <Stack direction='column'>
      <TableContainer sx={{ maxHeight: '200px' }}>
        <Table stickyHeader size='small'>
          <TableHead>
            <TableRow>
              <TableCell>GFA</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => {
              i++;
              return (
                <TableRow key={i}>
                  <TableCell>{file.values[0]}</TableCell>
                  <TableCell>
                    {file.values[2].split('/').reverse()[0]}
                  </TableCell>
                  <TableCell>
                    {file.lastSeenAt.toUTCString().split(' ')[4]}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
