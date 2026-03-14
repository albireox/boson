/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: BottomLevel.tsx
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

export default function BottomLevel() {
  const keywords = useKeywords([
    "tcc.PrimEncMount",
    "tcc.PrimDesEncMount",
    "tcc.PrimCmdMount",
    "tcc.SecEncMount",
    "tcc.SecDesEncMount",
    "tcc.SecCmdMount",
  ]);

  const {
    PrimEncMount: primEncMountw,
    PrimDesEncMount: primDesEncMountw,
    PrimCmdMount: primCmdMountw,
    SecEncMount: secEncMountw,
    SecDesEncMount: secDesEncMountw,
    SecCmdMount: secCmdMountw,
  } = keywords;

  const [primEnc, setPrimEnc] = React.useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [primDesEnc, setPrimDesEnc] = React.useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [primCmd, setPrimCmd] = React.useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [secEnc, setSecEnc] = React.useState<number[]>([0, 0, 0, 0, 0]);
  const [secDesEnc, setSecDesEnc] = React.useState<number[]>([0, 0, 0, 0, 0]);
  const [secCmd, setSecCmd] = React.useState<number[]>([0, 0, 0, 0, 0]);

  const sanitize = (vals: unknown, n: number): number[] => {
    if (!Array.isArray(vals) || vals.length < n) return Array(n).fill(0);
    return vals.slice(0, n).map((v) => {
      const num = Number(v);
      return Number.isFinite(num) ? num : 0;
    });
  };

  //console.log(secEncMountw);
  React.useEffect(() => setPrimEnc(sanitize(primEncMountw?.values,6)), [primEncMountw]);
  React.useEffect(() => setPrimDesEnc(sanitize(primDesEncMountw?.values,6)), [primDesEncMountw]);
  React.useEffect(() => setPrimCmd(sanitize(primCmdMountw?.values,6)), [primCmdMountw]);
  React.useEffect(() => setSecEnc(sanitize(secEncMountw?.values,5)), [secEncMountw]);
  React.useEffect(() => setSecDesEnc(sanitize(secDesEncMountw?.values,5)), [secDesEncMountw]);
  React.useEffect(() => setSecCmd(sanitize(secCmdMountw?.values,5)), [secCmdMountw]);

  const fmt = (value: number) => (Number.isFinite(value) ? Math.round(value) : "");

  const headers = ["Mount", "A (steps)", "B (steps)", "C (steps)", "D (steps)", "E (steps)", "F (steps)"];

  const rows = [
    { label: "Prim enc", values: primEnc },
    { label: "Prim des enc", values: primDesEnc },
    { label: "Prim cmd", values: primCmd },
    { label: "Sec enc", values: secEnc },
    { label: "Sec des enc", values: secDesEnc },
    { label: "Sec cmd", values: secCmd },
  ];

  return (
    <Box display="flex" flexDirection="column" borderTop={1} p={2} pt={1}>
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