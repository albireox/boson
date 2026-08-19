import React from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import { useKeywords } from "renderer/hooks";
import ExposureStateWdg from "./ExposureStateWdg";

type Severity = "normal" | "warning" | "error";

type StateInfo = {
  label: string;
  severity: Severity;
};

const shutterStateSevDict: Record<string, StateInfo> = {
  none: { label: "?", severity: "normal" },
  "0": { label: "?", severity: "warning" },
  "1": { label: "Open", severity: "normal" },
  "2": { label: "Closed", severity: "normal" },
  "3": { label: "Error", severity: "error" },
};

const motorStatusBits: Array<{ bitNum: number; description: string; severity: Severity }> = [
  { bitNum: 1, description: "Limit Switch", severity: "error" },
  { bitNum: 6, description: "Find Edge", severity: "warning" },
  { bitNum: 3, description: "Moving", severity: "warning" },
  { bitNum: 7, description: "Stopped", severity: "normal" },
  { bitNum: 2, description: "Motor Off", severity: "normal" },
];

function severityColor(severity: Severity): "text.primary" | "warning.main" | "error.main" {
  switch (severity) {
    case "warning":
      return "warning.main";
    case "error":
      return "error.main";
    default:
      return "text.primary";
  }
}

function getShutterState(value: unknown): StateInfo {
  if (value == null) {
    return shutterStateSevDict.none;
  }
  return shutterStateSevDict[String(Number(value))] ?? shutterStateSevDict["0"];
}

function getHartmannState(value: unknown): StateInfo {
  if (value == null) {
    return { label: "?", severity: "normal" };
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return { label: "?", severity: "warning" };
  }

  const basicDict: Record<number, StateInfo> = {
    0: { label: "?", severity: "warning" },
    1: { label: "Out", severity: "normal" },
    2: { label: "In", severity: "normal" },
    3: { label: "Error", severity: "error" },
  };

  const specialDict: Record<string, StateInfo> = {
    "1,1": { label: "Out", severity: "normal" },
    "1,2": { label: "Left In", severity: "normal" },
    "2,1": { label: "Right In", severity: "normal" },
    "2,2": { label: "Both In", severity: "normal" },
  };

  const leftVal = (numeric >> 2) & 0b11;
  const rightVal = numeric & 0b11;

  const special = specialDict[`${leftVal},${rightVal}`];
  if (special) {
    return special;
  }

  const left = basicDict[leftVal] ?? { label: "?", severity: "warning" as Severity };
  const right = basicDict[rightVal] ?? { label: "?", severity: "warning" as Severity };

  return {
    label: `${left.label} | ${right.label}`,
    severity:
      left.severity === "error" || right.severity === "error"
        ? "error"
        : left.severity === "warning" || right.severity === "warning"
        ? "warning"
        : "normal",
  };
}

function getMotorStatus(value: unknown): StateInfo {
  if (value == null) {
    return { label: "?", severity: "warning" };
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return { label: "?", severity: "warning" };
  }

  for (const { bitNum, description, severity } of motorStatusBits) {
    if (((1 << bitNum) & numeric) !== 0) {
      return { label: description, severity };
    }
  }

  return { label: "OK", severity: "normal" };
}

function formatPosition(value: unknown): string {
  if (value == null) return "?";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "?";
  return `${numeric}`;
}

function computeCollimatorSummary(statuses: StateInfo[]): StateInfo {
  if (statuses.some((status) => status.severity === "error")) {
    return { label: "Error", severity: "error" };
  }
  if (statuses.some((status) => status.severity === "warning")) {
    return { label: "Warning", severity: "warning" };
  }
  return { label: "OK", severity: "normal" };
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 14,
        textAlign: "right",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Typography>
  );
}

function RowValue({
  children,
  severity = "normal",
}: {
  children: React.ReactNode;
  severity?: Severity;
}) {
  return (
    <Typography
      sx={{
        fontSize: 14,
        color: severityColor(severity),
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Typography>
  );
}

export default function BOSSStatus() {
  const keywords = useKeywords([
    "boss.shutterStatus",
    "boss.screenStatus",
    "boss.motorPosition",
    "boss.motorStatus",
  ]);

  const [showCollimator, setShowCollimator] = React.useState(true);

  const shutterStatusW = keywords?.shutterStatus;
  const screenStatusW = keywords?.screenStatus;
  const motorPositionW = keywords?.motorPosition;
  const motorStatusW = keywords?.motorStatus;

  const shutterValues = React.useMemo(
    () => (Array.isArray(shutterStatusW?.values) ? shutterStatusW.values : []),
    [shutterStatusW]
  );

  const screenValues = React.useMemo(
    () => (Array.isArray(screenStatusW?.values) ? screenStatusW.values : []),
    [screenStatusW]
  );

  const motorPositionValues = React.useMemo(
    () => (Array.isArray(motorPositionW?.values) ? motorPositionW.values : []),
    [motorPositionW]
  );

  const motorStatusValues = React.useMemo(
    () => (Array.isArray(motorStatusW?.values) ? motorStatusW.values : []),
    [motorStatusW]
  );

  const shutterState = getShutterState(shutterValues[0]);
  const hartmannState = getHartmannState(screenValues[0]);

  const actuatorNames = ["A", "B", "C"];

  const actuatorPositions = actuatorNames.map((name, index) => ({
    name,
    value: formatPosition(motorPositionValues[index]),
  }));

  const actuatorStatuses = actuatorNames.map((name, index) => ({
    name,
    ...getMotorStatus(motorStatusValues[index]),
  }));

  const collimatorSummary = computeCollimatorSummary(
    actuatorStatuses.map((status) => ({
      label: status.label,
      severity: status.severity,
    }))
  );

  //resizing
  const COLLIMATOR_OPEN_SIZE = {width: 275, height: 375};
  const COLLIMATOR_CLOSED_SIZE = {width: 275, height: 205};

  React.useEffect(() => {
    const initialSize = showCollimator ? COLLIMATOR_OPEN_SIZE : COLLIMATOR_CLOSED_SIZE;
    void window.electron.app.resizeWindow(initialSize.width, initialSize.height);
  }, []); // Run once on mount

  console.log("Actuator Statuses:", actuatorStatuses);
  console.log("Collimator Summary:", collimatorSummary);

  return (
      <Box display="flex" flexDirection="column" gap={1} pt={1.5} pl={1}>
        <Box
          display="grid"
          gridTemplateColumns="max-content 1fr"
          columnGap={1.5}
          rowGap={0.75}
          alignItems="center"
        >
          <RowLabel>Exp Status</RowLabel>
          <ExposureStateWdg />
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="max-content max-content max-content"
          columnGap={1.5}
          rowGap={0.75}
          alignItems="center"
        >
          <Box />
          <Typography sx={{ fontSize: 14, textAlign: "center" }}>Spectro 1</Typography>
          <Box />

          <RowLabel>Shutter</RowLabel>
          <RowValue severity={shutterState.severity}>{shutterState.label}</RowValue>
          <Box />

          <RowLabel>Hartmann</RowLabel>
          <RowValue severity={hartmannState.severity}>{hartmannState.label}</RowValue>
          <Box />
        </Box>

        <Box pt={0.25}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setShowCollimator((prev) => {
                const next = !prev;
                const nextSize = next ? COLLIMATOR_OPEN_SIZE : COLLIMATOR_CLOSED_SIZE;

                void window.electron.app.resizeWindow(nextSize.width, nextSize.height);
                return next;
              });
              }}
            sx={{
              minWidth: 0,
              px: 1,
              py: 0.25,
              fontSize: 12,
              lineHeight: 1.2,
              textTransform: "none",
            }}
          >
            {showCollimator ? "Hide Collimator" : "Show Collimator"}
          </Button>
        </Box>

        {showCollimator && (
          <Box
            display="grid"
            gridTemplateColumns="max-content max-content max-content"
            columnGap={1.5}
            rowGap={0.75}
            alignItems="center"
            pt={0.25}
          >
            {actuatorPositions.map((actuator) => (
              <React.Fragment key={`pos-${actuator.name}`}>
                <RowLabel>{`Actuator ${actuator.name}`}</RowLabel>
                <RowValue>{actuator.value}</RowValue>
                <Typography sx={{ fontSize: 14, whiteSpace: "nowrap" }}>
                  steps
                </Typography>
              </React.Fragment>
            ))}

            {actuatorStatuses.map((actuator) => (
              <React.Fragment key={`status-${actuator.name}`}>
                <RowLabel>{`Actuator ${actuator.name}`}</RowLabel>
                <RowValue severity={actuator.severity}>{actuator.label}</RowValue>
                <Box />
              </React.Fragment>
            ))}
          </Box>
        )}
      </Box>
  );
}