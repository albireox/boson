/*
 *  @Author: Stephen Pan
 *  @Date: 2026-04-16
 *  @Filename: AlertInfo.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export type Severity =
  //severity levels for alerts, ordered from least to most severe
  | "ok"
  | "info"
  | "apogeediskwarn"
  | "warn"
  | "serious"
  | "critical"
  | "?";

export const severityOrder: Record<Severity, number> = {
  critical: 6,
  serious: 5,
  warn: 4,
  apogeediskwarn: 3,
  info: 2,
  ok: 1,
  "?": 0,
};

export type AlertInfo = {
  alertID: string;
  actor: string;
  keyword: string;
  severity: Severity;
  value: string;
  isEnabled: boolean;
  isAcknowledged: boolean;
  acknowledger: string | null;
  timestamp: number;
  };

export type DisableRule = {
  alertID: string;
  severity: Severity;
  issuer: string;
  disabledID: string;
  timestamp: number;
};

export type DownInstrument = {
  instName: string;
  disabledID: string;
  issuer: string;
  timestamp: number;
};

export function parseAlertID(alertID: string): { actor: string; keyword: string } {
  //parses the alertID into its actor and keyword components, assuming the format "actor.keyword"
  const parts = alertID.split(".");
  if (parts.length < 2) {
    return { actor: "?", keyword: "?" };
  }

  return {
    actor: parts[0],
    keyword: parts.slice(1).join("."),
  };
}

export function makeUnknownAlert(alertID: string): AlertInfo {
  //if the alert is active but we don't have any info on it, we can still display it with unknown values
  const { actor, keyword } = parseAlertID(alertID);

  return {
    alertID,
    actor,
    keyword,
    severity: "?",
    value: "?",
    isEnabled: true,
    isAcknowledged: false,
    acknowledger: null,
    timestamp: 0,
  };
  }

export function makeAlertFromKeyword(values: unknown[]): AlertInfo | null {
  //make an alert object from the keyword values, 
  //which should be in the format [alertID, severity, value, enabled/disabled, ack/unack, acknowledger]
  if (!Array.isArray(values) || values.length < 6) {
    return null;
  }

  const alertID = String(values[0]);
  const severity = String(values[1]).toLowerCase() as Severity;
  const value = String(values[2]);
  const isEnabled = String(values[3]).toLowerCase() === "enabled";
  const isAcknowledged = String(values[4]).toLowerCase() === "ack";
  const acknowledger = values[5] == null ? null : String(values[5]);

  const { actor, keyword } = parseAlertID(alertID);

  return {
    alertID,
    actor,
    keyword,
    severity,
    value,
    isEnabled,
    isAcknowledged,
    acknowledger,
    timestamp: Date.now(),
  };
}

export function isAlertDone(alert: AlertInfo): boolean {
  //an alert is considered "done" if its severity is "ok"
  return alert.severity === "ok";
}

export function isAlertUnknown(alert: AlertInfo): boolean {
  //an alert is considered "unknown" if its severity is "?"
  return alert.severity === "?";
}

export function alertsEqual(a: AlertInfo | undefined, b: AlertInfo | undefined): boolean {
  //checks if two alerts are equal
  if (!a || !b) return false;

  return (
    a.alertID === b.alertID &&
    a.severity === b.severity &&
    a.value === b.value &&
    a.isEnabled === b.isEnabled &&
    a.isAcknowledged === b.isAcknowledged &&
    a.acknowledger === b.acknowledger
  );
}

export function formatTimestamp(timestamp: number): string {
  //formats the timestamp as a human-readable time string. If the timestamp is 0 or invalid, returns "?"
  if (!timestamp) return "?";

  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getAckCommand(alert: AlertInfo): { command: string; label: string } {
  //gets the acknowledge command depending on the state of acknowledgement
  if (alert.isAcknowledged) {
    return {
      command: `alerts UnAcknowledge id=${alert.alertID} severity=${alert.severity}`,
      label: `Unacknowledge ${alert.alertID}`,
    };
  }

  return {
    command: `alerts Acknowledge id=${alert.alertID} severity=${alert.severity}`,
    label: `Acknowledge ${alert.alertID}`,
  };
}

export function getEnableCommand(alert: AlertInfo): { command: string; label: string; needsConfirm: boolean } {
  //gets the enable/disable command depending on the state of the alert.
  if (alert.isEnabled) {
    return {
      command: `alerts Disable id=${alert.alertID} severity=${alert.severity}`,
      label: `Disable ${alert.alertID}`,
      needsConfirm: true,
    };
  }

  return {
    command: `alerts Enable id=${alert.alertID} severity=${alert.severity}`,
    label: `Enable ${alert.alertID}`,
    needsConfirm: false,
  };
}