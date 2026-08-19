import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { lineClasses } from "@mui/x-charts/LineChart";
import { Keyword } from "main/tron/types";
import { useKeywords } from "renderer/hooks";

type ChartPoint = {
  time: number;
  sp1r0Read: number | null;
  sp1b2Read: number | null;
  sp1r0Nom: number | null;
  sp1b2Nom: number | null;
  ln2Pressure: number | null;
  ln2Threshold: number;
};

type KeywordValue = {
  values?: unknown[];
};

type TrackedHistory = {
  sp1r0Read: Keyword[];
  sp1b2Read: Keyword[];
  ln2Pressure: Keyword[];
};

const TIME_RANGE_SECONDS = 1800;
const TICK_MS = 1000;

function getFirstNumber(values: unknown[] | undefined): number | null {
  if (!Array.isArray(values) || values.length === 0) return null;

  const raw = values[0];
  if (raw == null) return null;

  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildEmptyHistory(
  now: number,
  sp1r0Nom: number | null,
  sp1b2Nom: number | null
): ChartPoint[] {
  const points: ChartPoint[] = [];
  const start = now - TIME_RANGE_SECONDS * 1000;

  for (let t = start; t <= now; t += TICK_MS) {
    points.push({
      time: t,
      sp1r0Read: null,
      sp1b2Read: null,
      sp1r0Nom,
      sp1b2Nom,
      ln2Pressure: null,
      ln2Threshold: 10.0,
    });
  }

  return points;
}

function buildTrackedHistory(
  now: number,
  sp1r0Nom: number | null,
  sp1b2Nom: number | null,
  history: TrackedHistory
): ChartPoint[] {
  const start = now - TIME_RANGE_SECONDS * 1000;

  const toEvents = (keywords: Keyword[]) =>
    keywords
      .map((keyword) => ({
        time: keyword.timestamp,
        value: getFirstNumber(keyword.values),
      }))
      .filter((event) => Number.isFinite(event.time))
      .sort((a, b) => a.time - b.time);

  const sp1r0Events = toEvents(history.sp1r0Read);
  const sp1b2Events = toEvents(history.sp1b2Read);
  const ln2Events = toEvents(history.ln2Pressure);

  let sp1r0Index = 0;
  let sp1b2Index = 0;
  let ln2Index = 0;

  let sp1r0Value: number | null = null;
  let sp1b2Value: number | null = null;
  let ln2Value: number | null = null;

  while (
    sp1r0Index < sp1r0Events.length &&
    sp1r0Events[sp1r0Index].time <= start
  ) {
    sp1r0Value = sp1r0Events[sp1r0Index].value;
    sp1r0Index += 1;
  }

  while (
    sp1b2Index < sp1b2Events.length &&
    sp1b2Events[sp1b2Index].time <= start
  ) {
    sp1b2Value = sp1b2Events[sp1b2Index].value;
    sp1b2Index += 1;
  }

  while (
    ln2Index < ln2Events.length &&
    ln2Events[ln2Index].time <= start
  ) {
    ln2Value = ln2Events[ln2Index].value;
    ln2Index += 1;
  }

  const points: ChartPoint[] = [];

  for (let t = start; t <= now; t += TICK_MS) {
    while (
      sp1r0Index < sp1r0Events.length &&
      sp1r0Events[sp1r0Index].time <= t
    ) {
      sp1r0Value = sp1r0Events[sp1r0Index].value;
      sp1r0Index += 1;
    }

    while (
      sp1b2Index < sp1b2Events.length &&
      sp1b2Events[sp1b2Index].time <= t
    ) {
      sp1b2Value = sp1b2Events[sp1b2Index].value;
      sp1b2Index += 1;
    }

    while (
      ln2Index < ln2Events.length &&
      ln2Events[ln2Index].time <= t
    ) {
      ln2Value = ln2Events[ln2Index].value;
      ln2Index += 1;
    }

    points.push({
      time: t,
      sp1r0Read: sp1r0Value,
      sp1b2Read: sp1b2Value,
      sp1r0Nom,
      sp1b2Nom,
      ln2Pressure: ln2Value,
      ln2Threshold: 10.0,
    });
  }

  return points;
}

export default function BOSSTemperatureMonitor() {
  const keywords = useKeywords([
    "boss.SP1R0CCDTempNom",
    "boss.SP1R0CCDTempRead",
    "boss.SP1B2CCDTempNom",
    "boss.SP1B2CCDTempRead",
    "boss.SP1SecondaryDewarPress",
  ]);

  const sp1r0NomW = keywords?.SP1R0CCDTempNom as KeywordValue | undefined;
  const sp1r0ReadW = keywords?.SP1R0CCDTempRead as KeywordValue | undefined;
  const sp1b2NomW = keywords?.SP1B2CCDTempNom as KeywordValue | undefined;
  const sp1b2ReadW = keywords?.SP1B2CCDTempRead as KeywordValue | undefined;
  const ln2PressureW = keywords?.SP1SecondaryDewarPress as KeywordValue | undefined;

  const sp1r0Nom = React.useMemo(() => getFirstNumber(sp1r0NomW?.values), [sp1r0NomW]);
  const sp1r0Read = React.useMemo(() => getFirstNumber(sp1r0ReadW?.values), [sp1r0ReadW]);
  const sp1b2Nom = React.useMemo(() => getFirstNumber(sp1b2NomW?.values), [sp1b2NomW]);
  const sp1b2Read = React.useMemo(() => getFirstNumber(sp1b2ReadW?.values), [sp1b2ReadW]);
  const ln2Pressure = React.useMemo(() => getFirstNumber(ln2PressureW?.values), [ln2PressureW]);

  const latestRef = React.useRef({
    sp1r0Nom: null as number | null,
    sp1r0Read: null as number | null,
    sp1b2Nom: null as number | null,
    sp1b2Read: null as number | null,
    ln2Pressure: null as number | null,
  });

  React.useEffect(() => {
    latestRef.current = {
      sp1r0Nom,
      sp1r0Read,
      sp1b2Nom,
      sp1b2Read,
      ln2Pressure,
    };
  }, [sp1r0Nom, sp1r0Read, sp1b2Nom, sp1b2Read, ln2Pressure]);

  const [data, setData] = React.useState<ChartPoint[]>(() =>
    buildEmptyHistory(Date.now(), sp1r0Nom, sp1b2Nom)
  );

  React.useEffect(() => {
    let cancelled = false;

    Promise.all([
      window.electron.tron
        .getAllKeywords("boss.SP1R0CCDTempRead")
        .catch(() => [] as Keyword[]),
      window.electron.tron
        .getAllKeywords("boss.SP1B2CCDTempRead")
        .catch(() => [] as Keyword[]),
      window.electron.tron
        .getAllKeywords("boss.SP1SecondaryDewarPress")
        .catch(() => [] as Keyword[]),
    ]).then(([sp1r0History, sp1b2History, ln2History]) => {
      if (cancelled) return;

      const latest = latestRef.current;
      setData(
        buildTrackedHistory(
          Date.now(),
          latest.sp1r0Nom,
          latest.sp1b2Nom,
          {
            sp1r0Read: sp1r0History,
            sp1b2Read: sp1b2History,
            ln2Pressure: ln2History,
          }
        )
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const latest = latestRef.current;

      setData((prev) => {
        const nextPoint: ChartPoint = {
          time: now,
          sp1r0Read: latest.sp1r0Read,
          sp1b2Read: latest.sp1b2Read,
          sp1r0Nom: latest.sp1r0Nom,
          sp1b2Nom: latest.sp1b2Nom,
          ln2Pressure: latest.ln2Pressure,
          ln2Threshold: 10.0,
        };

        const cutoff = now - TIME_RANGE_SECONDS * 1000;
        const trimmed = prev.filter((point) => point.time > cutoff);
        return [...trimmed, nextPoint];
      });
    };

    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    setData((prev) =>
      prev.map((point) => ({
        ...point,
        sp1r0Nom,
        sp1b2Nom,
      }))
    );
  }, [sp1r0Nom, sp1b2Nom]);

  const clearCharts = React.useCallback(() => {
    setData(buildEmptyHistory(Date.now(), sp1r0Nom, sp1b2Nom));
  }, [sp1r0Nom, sp1b2Nom]);

  const xData = React.useMemo(() => data.map((point) => point.time), [data]);
  const sp1r0ReadSeries = React.useMemo(() => data.map((point) => point.sp1r0Read), [data]);
  const sp1b2ReadSeries = React.useMemo(() => data.map((point) => point.sp1b2Read), [data]);
  const sp1r0NomSeries = React.useMemo(() => data.map((point) => point.sp1r0Nom), [data]);
  const sp1b2NomSeries = React.useMemo(() => data.map((point) => point.sp1b2Nom), [data]);
  const ln2PressureSeries = React.useMemo(() => data.map((point) => point.ln2Pressure), [data]);
  const ln2ThresholdSeries = React.useMemo(() => data.map((point) => point.ln2Threshold), [data]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={0.5}
      p={1}
      sx={{
        width: "100%",
        minWidth: 650,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        BOSS Temperature Monitor
      </Typography>

      <Box>
        <LineChart
          height={250}
          xAxis={[
            {
              data: xData,
              scaleType: "time",
              valueFormatter: (value) => formatTime(Number(value)),
            },
          ]}
          yAxis={[
            {
              min: -140,
              max: -90,
              label: "CCDTemp (C)",
            },
          ]}
          series={[
            {
              id: "sp1r0-read",
              label: "sp1r0",
              data: sp1r0ReadSeries,
              color: "red",
              showMark: false,
              curve: "linear",
              connectNulls: false,
            },
            {
              id: "sp1b2-read",
              label: "sp1b2",
              data: sp1b2ReadSeries,
              color: "green",
              showMark: false,
              curve: "linear",
              connectNulls: false,
            },
            {
              id: "sp1r0-nom",
              label: "sp1r0 nom",
              data: sp1r0NomSeries,
              color: "red",
              showMark: false,
              curve: "linear",
              connectNulls: true,
            },
            {
              id: "sp1b2-nom",
              label: "sp1b2 nom",
              data: sp1b2NomSeries,
              color: "green",
              showMark: false,
              curve: "linear",
              connectNulls: true,
            },
          ]}
          margin={{ left: 65, right: 20, top: 20, bottom: 30 }}
          grid={{ vertical: true, horizontal: true }}
          sx={{
            [`& .${lineClasses.line}[data-series="sp1r0-nom"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .${lineClasses.line}[data-series="sp1r0 nom"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .MuiLineElement-root[data-series="sp1r0-nom"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .MuiLineElement-root[data-series="sp1r0 nom"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },

            [`& .${lineClasses.line}[data-series="sp1b2-nom"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .${lineClasses.line}[data-series="sp1b2 nom"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .MuiLineElement-root[data-series="sp1b2-nom"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .MuiLineElement-root[data-series="sp1b2 nom"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
          }}
        />
      </Box>

      <Box>
        <LineChart
          height={210}
          xAxis={[
            {
              data: xData,
              scaleType: "time",
              valueFormatter: (value) => formatTime(Number(value)),
            },
          ]}
          yAxis={[
            {
              min: 0.1,
              max: 10.5,
              label: "Ln2 Pressure",
            },
          ]}
          series={[
            {
              id: "ln2-threshold",
              label: "threshold",
              data: ln2ThresholdSeries,
              color: "gray",
              showMark: false,
              curve: "linear",
              connectNulls: true,
            },
            {
              id: "ln2-pressure",
              label: "sp1",
              data: ln2PressureSeries,
              color: "blue",
              showMark: false,
              curve: "linear",
              connectNulls: false,
            },
          ]}
          margin={{ left: 65, right: 20, top: 20, bottom: 30 }}
          grid={{ vertical: true, horizontal: true }}
          sx={{
            [`& .${lineClasses.line}[data-series="ln2-threshold"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .${lineClasses.line}[data-series="threshold"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .MuiLineElement-root[data-series="ln2-threshold"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },
            [`& .MuiLineElement-root[data-series="threshold"]`]: {
              strokeDasharray: "6 4",
              strokeWidth: 1.5,
            },

            [`& .${lineClasses.line}[data-series="ln2-pressure"]`]: {
              strokeWidth: 2,
            },
            [`& .${lineClasses.line}[data-series="sp1"]`]: {
              strokeWidth: 2,
            },
            [`& .MuiLineElement-root[data-series="ln2-pressure"]`]: {
              strokeWidth: 2,
            },
            [`& .MuiLineElement-root[data-series="sp1"]`]: {
              strokeWidth: 2,
            },
          }}
        />
      </Box>

      <Box>
        <Button
          variant="outlined"
          size="small"
          onClick={clearCharts}
          sx={{
            minWidth: 0,
            px: 1,
            py: 0.25,
            fontSize: 12,
            lineHeight: 1.2,
            textTransform: "none",
          }}
        >
          C
        </Button>
      </Box>
    </Box>
  );
}