/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: TopLevel.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import React from "react";
import { Box } from "@mui/system";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useKeywords } from "renderer/hooks";

export default function TopLevel() {
  const keywords = useKeywords([
    "tcc.PrimOrient",
    "tcc.PrimDesOrient",
    "tcc.SecOrient",
    "tcc.SecDesOrient",
  ]);

  const {
    PrimOrient: primOrientw,
    PrimDesOrient: primDesOrientw,
    SecOrient: secOrientw,
    SecDesOrient: secDesOrientw,
  } = keywords;

  const [primOrient, setPrimOrient] = React.useState<number[]>([0, 0, 0, 0, 0]);
  const [primDesOrient, setPrimDesOrient] = React.useState<number[]>([0, 0, 0, 0, 0]);
  const [secOrient, setSecOrient] = React.useState<number[]>([0, 0, 0, 0, 0]);
  const [secDesOrient, setSecDesOrient] = React.useState<number[]>([0, 0, 0, 0, 0]);

  const sanitize5 = (vals: unknown): number[] => {
    //this function takes in the values of an orientation keyword and sanitizes it into an array of 5 numbers,
    if (!Array.isArray(vals) || vals.length < 5) return [0, 0, 0, 0, 0];
    return vals.slice(0, 5).map((v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    });
  };

  React.useEffect(() => setPrimOrient(sanitize5(primOrientw?.values)), [primOrientw]);
  React.useEffect(() => setPrimDesOrient(sanitize5(primDesOrientw?.values)), [primDesOrientw]);
  React.useEffect(() => setSecOrient(sanitize5(secOrientw?.values)), [secOrientw]);
  React.useEffect(() => setSecDesOrient(sanitize5(secDesOrientw?.values)), [secDesOrientw]);

  const fmt = (value: number) => (Number.isFinite(value) ? value.toFixed(2) : "");

  const headers = [
    "Orientation",
    "Piston (μm)",
    `X Tilt (")`,
    `Y Tilt(")`,
    `X Trans (μm)`,
    `Y Trans (μm)`,
  ];

  const rows = [
    { label: "Prim orient", values: primOrient },
    { label: "Prim des", values: primDesOrient },
    { label: "Sec orient", values: secOrient },
    { label: "Sec des", values: secDesOrient },
  ];

  return (
    <Box display="flex" flexDirection="column" borderTop={1} p={2} pt={5}>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                {headers[0]}
              </TableCell>
              {headers.slice(1).map((h) => (
                <TableCell
                  key={h}
                  align="right"
                  sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.label}</TableCell>
                {row.values.map((v, i) => (
                  <TableCell
                    key={i}
                    align="right"
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmt(v)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}