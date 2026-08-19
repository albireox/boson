import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useKeywords } from "renderer/hooks";
import StatusWdg from "./StatusWdg";
import ShutterWdgSet from "./ShutterWdgSet";
import CalBoxWdgSet from "./CalBoxWdgSet";
import CollWdgSet from "./CollWdgSet";
import FPIShutterWdg from "./FPIShutterWdg";
import ExposeWdg, { type ExposeWdgHandle } from "./ExposeWdg";
import { useDeviceCommand } from "./useDeviceCommand";

interface APOGEEWdgProps {
  /** Overrides the STUI rule that hides the physical cold shutter at LCO. */
  showColdShutter?: boolean;
}

const RUNNING_EXPOSURE_STATES = new Set([
  "exposing",
  "reading",
  "integrating",
  "processing",
  "utr",
]);

const DEFAULT_WINDOW_WIDTH = 410;
const DEFAULT_WINDOW_HEIGHT = 440;

export default function APOGEEWdg({
  showColdShutter,
}: APOGEEWdgProps) {
  const keywords = useKeywords(["apogee.exposureState"]);
  const exposureStateW = keywords.exposureState;

  const exposeRef = React.useRef<ExposeWdgHandle | null>(null);
  const scriptRunningRef = React.useRef(false);
  const cancelRequestedRef = React.useRef(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const [scriptRunning, setScriptRunning] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");

  React.useEffect(() => {
    const root = rootRef.current;
    const scrollArea = scrollAreaRef.current;
    const content = contentRef.current;
  
    if (!root || !scrollArea || !content) {
      return;
    }
  
    const resizeToContent = () => {
      const scrollAreaStyle =
        window.getComputedStyle(scrollArea);
  
      const verticalPadding =
        (Number.parseFloat(
          scrollAreaStyle.paddingTop
        ) || 0) +
        (Number.parseFloat(
          scrollAreaStyle.paddingBottom
        ) || 0);
  
      const fixedHeight =
        root.offsetHeight -
        scrollArea.clientHeight;
  
      const height = Math.max(
        DEFAULT_WINDOW_HEIGHT,
        Math.ceil(
          content.scrollHeight +
            verticalPadding +
            fixedHeight +
            50
        )
      );
  
      window.electron.app.resizeWindow(
        DEFAULT_WINDOW_WIDTH,
        height
      );
    };
  
    const observer =
      new ResizeObserver(resizeToContent);
  
    observer.observe(content);
  
    resizeToContent();
  
    return () => {
      observer.disconnect();
    };
  }, []);

  const isExposing = React.useMemo(() => {
    const state = String(exposureStateW?.values?.[0] ?? "").toLowerCase();
    return RUNNING_EXPOSURE_STATES.has(state);
  }, [exposureStateW]);

  const sendApogeeCommand = React.useCallback(
    (command: string) => window.electron.tron.send(`apogee ${command}`, true),
    []
  );
  const stopCommand = useDeviceCommand(sendApogeeCommand, setStatusMessage);

  const runExposure = React.useCallback(async () => {
    if (scriptRunningRef.current || exposeRef.current == null) return;

    scriptRunningRef.current = true;
    cancelRequestedRef.current = false;
    setScriptRunning(true);

    try {
      const ditherCommand = exposeRef.current.getDitherCmd();
      const exposureCommand = exposeRef.current.getExposureCmd();

      if (ditherCommand) {
        setStatusMessage(`${ditherCommand} running`);
        await sendApogeeCommand(ditherCommand);
        setStatusMessage("dither finished");
      }

      if (cancelRequestedRef.current) {
        setStatusMessage("Exposure sequence cancelled");
        return;
      }

      setStatusMessage(`${exposureCommand} running`);
      await sendApogeeCommand(exposureCommand);
      setStatusMessage(
        cancelRequestedRef.current
          ? "Cancel was requested; expose command finished"
          : "expose finished"
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Exposure command failed"
      );
    } finally {
      scriptRunningRef.current = false;
      setScriptRunning(false);
    }
  }, [sendApogeeCommand]);

  const stopExposure = React.useCallback(() => {
    void stopCommand.doCmd("expose stop", {
      running: "stop running",
      success: "stop finished",
      failure: "stop failed",
    });
  }, [stopCommand]);

  const cancelExposureSequence = React.useCallback(() => {
    cancelRequestedRef.current = true;
    setStatusMessage(
      "Cancel requested; the current command will finish before cancellation"
    );
  }, []);

  const bottomButtonSx = {
    minHeight: 25,
    px: 0.75,
    py: 0,
    borderRadius: 0,
    borderTop: 0,
    borderBottom: 0,
    borderLeft: 0,
    borderRight: "1px solid",
    borderColor: "divider",
    color: "text.primary",
    bgcolor: "background.paper",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1,
    textTransform: "none",
    "&:hover": { bgcolor: "action.hover" },
    "&.Mui-disabled": { color: "text.disabled" },
  } as const;

  return (
    <Box
      ref={rootRef}
      sx={{
        width: "100%",
        minWidth: 410,
        minHeight: 360,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "text.primary",
        overflow: "hidden",
        "& .MuiTypography-root, & .MuiButton-root, & .MuiInputBase-root": {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <Box
        ref={scrollAreaRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          px: 0.25,
          pt: 1.5,
          pb: 0.35,
        }}
      >
        <Box
          ref={contentRef}
          sx={{ display: "flex", flexDirection: "column", gap: 0.35 }}
        >
          <StatusWdg />
          <ShutterWdgSet
            onStatusMessage={setStatusMessage}
            showColdShutter={showColdShutter}
          />
          <CalBoxWdgSet onStatusMessage={setStatusMessage} />
          <CollWdgSet onStatusMessage={setStatusMessage} />
          <FPIShutterWdg onStatusMessage={setStatusMessage} />
          <Box sx={{ pt: 0.25 }}>
            <ExposeWdg ref={exposeRef} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          minHeight: 21,
          px: 0.25,
          display: "flex",
          alignItems: "center",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          noWrap
          title={statusMessage}
          sx={{ fontSize: 14, lineHeight: 1.1, width: "100%" }}
        >
          {statusMessage}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "stretch", minHeight: 25 }}>
        <Button
          disabled={scriptRunning || isExposing}
          onClick={() => void runExposure()}
          sx={{ ...bottomButtonSx, minWidth: 68 }}
        >
          Expose
        </Button>
        <Button
          disabled={!isExposing || stopCommand.isRunning}
          onClick={stopExposure}
          sx={{ ...bottomButtonSx, minWidth: 55 }}
        >
          Stop
        </Button>
        <Button
          disabled={!scriptRunning || cancelRequestedRef.current}
          onClick={cancelExposureSequence}
          sx={{ ...bottomButtonSx, minWidth: 35, maxWidth: 35 }}
        >
          X
        </Button>
      </Box>
    </Box>
  );
}
