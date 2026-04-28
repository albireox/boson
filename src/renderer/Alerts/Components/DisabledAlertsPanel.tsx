/*
 *  @Author: Stephen Pan
 *  @Date: 2026-04-16
 *  @Filename: DisabledAlertsPanel.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    Menu,
    MenuItem,
    Paper,
    Select,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useKeywords } from "renderer/hooks";
import type { AlertInfo } from "./AlertInfo";

type RuleRow =
// represents either a disabled alert rule or a down instrument, normalized for display in the table
    | {
    kind: "downInstrument";
    disabledID: string;
    instName: string;
    issuer: string;
    severity: "critical";
    }
    | {
    kind: "disabledRule";
    disabledID: string;
    alertID: string;
    severity: string;
    issuer: string;
    };

type ContextMenuState = {
    //tells the context menu which row was right-clicked and where to open
    mouseX: number;
    mouseY: number;
    row: RuleRow | null;
} | null;

function rowColor(severity: string): "warning.main" | "error.main" | "text.primary" {
    //grabs color based on severity
    switch (severity) {
    case "warn":
        return "warning.main";
    case "serious":
    case "critical":
        return "error.main";
    default:
        return "text.primary";
    }
}

function parseDisabledRules(values: unknown[]): RuleRow[] {
    //parses the disabled rules from the keyword values
    const rows: RuleRow[] = [];
    const rawValues = Array.isArray(values) ? values : [];

    for (let i = 0; i + 2 < rawValues.length; i += 3) {
    const rawAlertID = String(rawValues[i] ?? "");
    const rawSeverity = String(rawValues[i + 1] ?? "");
    const rawIssuer = String(rawValues[i + 2] ?? "");

    //some of the keywords have extra parentheses and quotes around them, so we need to clean them up
    const alertID = rawAlertID.replace(/^"+\(?\s*/, "").trim();
    const severity = rawSeverity.replace(/^"+\s*/, "").trim().toLowerCase();
    const issuer = rawIssuer.replace(/\)?"+$/, "").trim();

    if (!alertID || !severity) continue;
    
    //push the rule into the rows array with a unique disabledID that combines the alertID and severity
    rows.push({
        kind: "disabledRule",
        disabledID: `(${alertID},${severity})`,
        alertID,
        severity,
        issuer,
    });
    }

  return rows;
}

function parseDownInstruments(values: unknown[]): RuleRow[] {

    //parses the down instruments from the keyword values, which should just be a list of instrument names
    const rows: RuleRow[] = [];
    const rawValues = Array.isArray(values) ? values : [];

    for (const raw of rawValues) {
    if (raw == null) continue;

    const instName = String(raw).trim();
    if (!instName || instName === "None") continue;

    rows.push({
        kind: "downInstrument",
        disabledID: `__downInst.${instName}`,
        instName,
        issuer: "?",
        severity: "critical",
    });
    }

    return rows;
    }

function buildClearCommand(row: RuleRow): { command: string; label: string } {
    //builds the command to clear the disabled rule or down instrument based on the row data, 
    // and also returns a label for the context menu item
    if (row.kind === "downInstrument") {
    return {
        command: `alerts instrumentState instrument=${row.instName} up`,
        label: `Enable ${row.instName}`,
    };
    }

    return {
    command: `alerts enable id=${row.alertID} severity=${row.severity}`,
    label: `Enable ${row.alertID} ${row.severity}`,
    };
    }

export default function DisabledAlertsPanel() {
    const keywords = useKeywords([
    "alerts.disabledAlertRules",
    "alerts.downInstruments",
    "alerts.instrumentNames",
    "alerts.alert",
    ]);

    const [showRules, setShowRules] = React.useState(true);
    const [contextMenu, setContextMenu] = React.useState<ContextMenuState>(null);

    const [addRuleOpen, setAddRuleOpen] = React.useState(false);
    const [downInstOpen, setDownInstOpen] = React.useState(false);

    const [newActor, setNewActor] = React.useState("");
    const [newKeyword, setNewKeyword] = React.useState("");
    const [newSeverity, setNewSeverity] = React.useState("critical");

    const [selectedInstrument, setSelectedInstrument] = React.useState("");

    const disabledRulesW = keywords?.disabledAlertRules;
    const downInstrumentsW = keywords?.downInstruments;
    const instrumentNamesW = keywords?.instrumentNames;

    const disabledRuleRows = React.useMemo(() => {
        //grabs the disabled rules from the keyword and parses them into rows for the table
        const values = Array.isArray(disabledRulesW?.values) ? disabledRulesW.values : [];
        return parseDisabledRules(values);
    }, [disabledRulesW]);

    const downInstrumentRows = React.useMemo(() => {
        //grabs the down instruments from the keyword and parses them into rows for the table
        const values = Array.isArray(downInstrumentsW?.values) ? downInstrumentsW.values : [];
        return parseDownInstruments(values);
    }, [downInstrumentsW]);

    const instrumentNames = React.useMemo(() => {
        //grabs the instrument names from the keyword and 
        //parses them into a sorted list for the dropdown in the down instrument dialog
        const values = Array.isArray(instrumentNamesW?.values) ? instrumentNamesW.values : [];
        return values
            .map((v: unknown) => String(v))
            .filter((v: string) => v && v !== "None")
            .sort((a: string, b: string) => a.localeCompare(b));
    }, [instrumentNamesW]);

    const rows = React.useMemo(() => {
        //disabled rules and down instruments together for the table
        //sorted with down instruments first (sorted by instrument name) and then disabled rules (sorted by severity and then alertID)
        const downSorted = [...downInstrumentRows].sort((a, b) => {
            if (a.kind !== "downInstrument" || b.kind !== "downInstrument") return 0;
            return a.instName.localeCompare(b.instName);
        });

        const ruleSorted = [...disabledRuleRows].sort((a, b) => {
            if (a.kind !== "disabledRule" || b.kind !== "disabledRule") return 0;
            if (a.severity !== b.severity) return b.severity.localeCompare(a.severity);
            return a.alertID.localeCompare(b.alertID);
        });

        return [...downSorted, ...ruleSorted]; //returns a copy of the arrays combined
    }, [downInstrumentRows, disabledRuleRows]);

    const sendCommand = async (command: string) => {
        //send a command to tron and catch any errors, then close the context menu
        try {
            await window.electron.tron.send(command);
        } catch (err) {
            console.error("tron send failed:", err);
        } finally {
            setContextMenu(null);
        }
    };

    const numDisabled = rows.length;

    const handleAddRule = async () => {
        //builds the command to add a new disabled alert rule based on the input values and sends it to tron
        if (!newActor.trim() || !newKeyword.trim()) {
            return;
    }

        const alertID = `${newActor.trim()}.${newKeyword.trim()}`;
        const command = `alerts disable id=${alertID} severity=${newSeverity.toLowerCase()}`;

        try {
            await window.electron.tron.send(command);
            setAddRuleOpen(false);
            setNewActor("");
            setNewKeyword("");
            setNewSeverity("critical");
        } catch (err) {
            console.error("tron send failed:", err);
        }
    };

    const handleDownInstrument = async () => {
        //sends command for down instrument
        if (!selectedInstrument.trim()) {
            return;
        }

        const command = `alerts instrumentState instrument=${selectedInstrument} down`;

        try {
            await window.electron.tron.send(command);
            setDownInstOpen(false);
            setSelectedInstrument("");
        } catch (err) {
            console.error("tron send failed:", err);
        }
    };

  return (
    <Box display="flex" flexDirection="column" gap={2} p={2} pt={1} width="100%">
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography variant="h6">Disable Alert Rules</Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="outlined" onClick={() => setAddRuleOpen(true)}>
            Add Rule
          </Button>
          <Button variant="outlined" onClick={() => setDownInstOpen(true)}>
            Down Instrument
          </Button>
        </Box>
      </Box>

      {showRules && (
        <Paper elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>ID / Instrument</TableCell>
                <TableCell>Issuer</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.disabledID}
                  hover
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setContextMenu({
                      mouseX: event.clientX + 2,
                      mouseY: event.clientY - 6,
                      row,
                    });
                  }}
                  sx={{ cursor: "context-menu" }}
                >
                  <TableCell>
                    {row.kind === "downInstrument" ? "Down" : "Rule"}
                  </TableCell>

                  <TableCell sx={{ color: rowColor(row.severity), fontWeight: 600 }}>
                    {row.kind === "downInstrument" ? "critical" : row.severity}
                  </TableCell>

                  <TableCell>
                    {row.kind === "downInstrument" ? row.instName : row.alertID}
                  </TableCell>

                  <TableCell>{row.issuer || "?"}</TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No disable alert rules
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.row && (
          <MenuItem
            onClick={() => {
              const { command } = buildClearCommand(contextMenu.row!);
              void sendCommand(command);
            }}
          >
            {buildClearCommand(contextMenu.row).label}
          </MenuItem>
        )}
      </Menu>

      <Dialog open={addRuleOpen} onClose={() => setAddRuleOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Rule</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Actor"
              value={newActor}
              onChange={(e) => setNewActor(e.target.value)}
              fullWidth
            />
            <TextField
              label="Keyword"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="severity-label">Severity</InputLabel>
              <Select
                labelId="severity-label"
                value={newSeverity}
                label="Severity"
                onChange={(e) => setNewSeverity(String(e.target.value))}
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="serious">Serious</MenuItem>
                <MenuItem value="warn">Warn</MenuItem>
                <MenuItem value="apogeediskwarn">ApogeeDiskWarn</MenuItem>
                <MenuItem value="info">Info</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRuleOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRule} variant="contained">
            Add Rule
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={downInstOpen} onClose={() => setDownInstOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Down Instrument</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <FormControl fullWidth>
              <InputLabel id="instrument-label">Instrument</InputLabel>
              <Select
                labelId="instrument-label"
                value={selectedInstrument}
                label="Instrument"
                onChange={(e) => setSelectedInstrument(String(e.target.value))}
              >
                {instrumentNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownInstOpen(false)}>Cancel</Button>
          <Button onClick={handleDownInstrument} variant="contained">
            Mark Down
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}