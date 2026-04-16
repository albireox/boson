/*
 *  @Author: Stephen Pan
 *  @Date: 2026-04-16
 *  @Filename: ActiveAlerts.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import React from "react";
import {
    Box,
    FormControlLabel,
    FormGroup,
    Menu,
    MenuItem,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useKeywords } from "renderer/hooks";
import {
    AlertInfo,
    alertsEqual,
    formatTimestamp,
    getAckCommand,
    getEnableCommand,
    isAlertDone,
    isAlertUnknown,
    makeAlertFromKeyword,
    makeUnknownAlert,
    severityOrder,
} from "./AlertInfo";

type ContextMenuState = {
    //grabs mouse position to open the menu
    mouseX: number;
    mouseY: number;
    alert: AlertInfo | null;
} | null;

function severityColor(
    //determines the color of the alert based on its severity
    severity: AlertInfo["severity"]
    ): "warning.main" | "error.main" | "text.primary" {
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

export default function ActiveAlerts() {

    const keywords = useKeywords([
        "alerts.alert",
        "alerts.activeAlerts",
    ]);

    const [alertDict, setAlertDict] = React.useState<Record<string, AlertInfo>>({});
    const [showDisabled, setShowDisabled] = React.useState<boolean>(true);
    const [contextMenu, setContextMenu] = React.useState<ContextMenuState>(null);

    const activeAlertsW = keywords?.activeAlerts;
    const alertW = keywords?.alert;

    React.useEffect(() => {
        // Initialize alertDict based on activeAlerts keyword
        if (!activeAlertsW) {
        setAlertDict({});
        return;
        }

        const rawValues = Array.isArray(activeAlertsW.values) ? activeAlertsW.values : [];
        // If the only value is "None", treat it as an empty list
        const currentIDs = rawValues.length === 1 && String(rawValues[0]) === "None" ? [] : rawValues.map((v: unknown) => String(v));

        setAlertDict((prev) => {
        const next: Record<string, AlertInfo> = {};

        for (const alertID of currentIDs) {
            next[alertID] = prev[alertID] ?? makeUnknownAlert(alertID);
        }

        return next;
        });
    }, [activeAlertsW]);

    React.useEffect(() => {
        // Update a single alert based on the alert keyword, which is expected to change whenever any alert updates
        if (!alertW || !Array.isArray(alertW.values)) {
        return;
        }

        //first, parse the alert from the keyword values. If parsing fails, do nothing
        const newAlert = makeAlertFromKeyword(alertW.values);
        
        if (!newAlert) return;

        //this part checks if the alert already exists, and if it does, if it's changed. 
        // If it hasn't changed, do nothing. 
        setAlertDict((prev) => {
        const oldAlert = prev[newAlert.alertID];

        if (alertsEqual(oldAlert, newAlert)) {
            return prev;
        }

        // If the alert is new or has changed, create a new dict by copying the old one. 
        // If the alert is done, remove it from the dict
        const next = { ...prev };

        if (isAlertDone(newAlert)) {
            delete next[newAlert.alertID];
        } else {
            next[newAlert.alertID] = newAlert;
        }

        return next;
        });
    }, [alertW]);


    const alertList = React.useMemo(() => {
        // Convert the alertDict to a list, filter out disabled alerts if showDisabled is false, 
        // and sort by severity (critical > serious > warn > ok), then by timestamp (oldest first), then by alertID
        return Object.values(alertDict)
        .filter((alert) => showDisabled || alert.isEnabled)
        .sort((a, b) => {
            const sevDiff = severityOrder[b.severity] - severityOrder[a.severity];
            if (sevDiff !== 0) return sevDiff;

            const timeDiff = a.timestamp - b.timestamp;
            if (timeDiff !== 0) return timeDiff;

            return a.alertID.localeCompare(b.alertID);
        });
    }, [alertDict, showDisabled]);

    const numDisabled = React.useMemo(() => {
        // Count the number of disabled alerts in the dict
        return Object.values(alertDict).filter((alert) => !alert.isEnabled).length;
    }, [alertDict]);

    const switchLabel = `${numDisabled} disabled`;

    const handleCloseMenu = () => {
        // Closes the context menu by setting its state to null
        setContextMenu(null);
    };

  const sendCommand = async (command: string) => {
    // Sends a command to the main process via tron, and logs any errors. Finally, it closes the context menu.
        try {
        await window.electron.tron.send(command);
        } catch (err) {
        console.error("tron send failed:", err);
        } finally {
        handleCloseMenu();
        }
  };

  const handleAckClick = () => {
    //sends the ack command
        const alert = contextMenu?.alert;
        if (!alert || isAlertUnknown(alert)) return;

        const { command } = getAckCommand(alert);
        void sendCommand(command);
  };

  const handleEnableClick = () => {
    //sends enable command, with confirmation window
        const alert = contextMenu?.alert;
        if (!alert || isAlertUnknown(alert)) return;

        const { command, needsConfirm } = getEnableCommand(alert);

        if (needsConfirm) {
        const confirmed = window.confirm(`Really send:\n${command}?`);
        if (!confirmed) {
            handleCloseMenu();
            return;
        }
    }

        void sendCommand(command);
  };

  return (
        <Box display="flex" flexDirection="column" gap={2} p={2} pt={1} width="100%">
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
        >
            <Typography variant="h6">Active Alerts</Typography>

            <FormGroup>
            <FormControlLabel
                control={
                <Switch
                    checked={showDisabled}
                    onChange={(e) => setShowDisabled(e.target.checked)}
                />
                }
                label={switchLabel}
            />
            </FormGroup>
        </Box>

        <Paper elevation={1}>
            <Table size="small">
            <TableHead>
                <TableRow>
                <TableCell>Severity</TableCell>
                <TableCell>Alert ID</TableCell>
                <TableCell>Ack</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Value</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {alertList.map((alert) => (
                <TableRow
                    key={alert.alertID}
                    hover
                    onContextMenu={(event) => {
                    event.preventDefault();
                    setContextMenu({
                        mouseX: event.clientX + 2,
                        mouseY: event.clientY - 6,
                        alert,
                    });
                    }}
                    sx={{
                    cursor: "context-menu",
                    textDecoration: alert.isEnabled ? "none" : "line-through",
                    opacity: alert.isEnabled ? 1 : 0.6,
                    }}
                >
                    <TableCell sx={{ color: severityColor(alert.severity), fontWeight: 600 }}>
                    {alert.severity}
                    </TableCell>
                    <TableCell>{alert.alertID}</TableCell>
                    <TableCell>{alert.isAcknowledged ? "Yes" : "No"}</TableCell>
                    <TableCell>{alert.isEnabled ? "Yes" : "No"}</TableCell>
                    <TableCell>{formatTimestamp(alert.timestamp)}</TableCell>
                    <TableCell>{alert.value}</TableCell>
                </TableRow>
                ))}

                {alertList.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} align="center">
                    No active alerts
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </Paper>

        <Menu
            open={contextMenu !== null}
            onClose={handleCloseMenu}
            anchorReference="anchorPosition"
            anchorPosition={
            contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
        >
            {contextMenu?.alert && isAlertUnknown(contextMenu.alert) ? (
            <MenuItem disabled>{`Unknown ${contextMenu.alert.alertID}`}</MenuItem>
            ) : (
            [
                <MenuItem key="ack" onClick={handleAckClick}>
                {contextMenu?.alert ? getAckCommand(contextMenu.alert).label : "Acknowledge"}
                </MenuItem>,
                <MenuItem key="enable" onClick={handleEnableClick}>
                {contextMenu?.alert ? getEnableCommand(contextMenu.alert).label : "Enable"}
                </MenuItem>,
            ]
            )}
        </Menu>
        </Box>
  );
}