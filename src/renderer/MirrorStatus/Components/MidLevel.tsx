/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: MidLevel.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


import { Box } from '@mui/system';
import React from 'react';
import { LinearProgress, Typography } from '@mui/material';
import { useKeywords } from 'renderer/hooks';


type ParsedState = {
    //the current state type
    state: string;
    iter: number;
    maxIter: number;
    remaining: number;
    totalTime: number;
};

function clamp(value: number, lo = 0, hi = 100): number {
    //this function clamps a number between a lower and upper bound, defaulting to 0 and 100
    return Math.max(lo, Math.min(hi, value));
}

function parseState(values: unknown): ParsedState {
    //this function takes in the values of a state keyword and parses it into a structured format, 
    //ensuring that all numeric values are valid and non-negative
    const arr = Array.isArray(values) ? values : [];
    const state = String(arr[0] ?? "");

    const curIter = Number(arr[1]);
    const maxIter = Number(arr[2]);
    const remaining = Number(arr[3]);
    const totalTime = Number(arr[4]);

    return {
        state: state || "Unknown",
        iter: Number.isFinite(curIter) && curIter >= 0 ? curIter : 0,
        maxIter: Number.isFinite(maxIter) && maxIter >= 0 ? maxIter : 0,
        remaining: Number.isFinite(remaining) && remaining >= 0 ? remaining : 0,
        totalTime: Number.isFinite(totalTime) && totalTime >= 0 ? totalTime : 0,
    };
}

function computeProgress(mirrorstate: ParsedState): number {
    //this function computes the progress percentage based on the current iteration and maximum iterations, 
    //returning a value between 0 and 100
    if (mirrorstate.totalTime > 0) {
        const frac = 1 - mirrorstate.remaining / mirrorstate.totalTime;
        return clamp(frac * 100);
    }
    //fallback to iteration-based progress if total time is not available
    if (mirrorstate.maxIter > 0) {
        const frac = mirrorstate.iter / mirrorstate.maxIter;
        return clamp(frac * 100);
    }
}

function MountProgress({ title, values }: { title: string; values: unknown }) {
    const parsed = React.useMemo(() => parseState(values), [values]);
    const isActive = parsed.state === "Moving" || parsed.state === "Homing";
    const progress = React.useMemo(() => computeProgress(parsed), [parsed]);
  
    const remainingUp = Math.max(0, Math.floor(parsed.remaining));

    //this removes the "emptying" animation when moving to the next iteration
    const prevProgressRef = React.useRef(0);
    const [disableAnim, setDisableAnim] = React.useState(false);

    React.useEffect(() => {
    // On next animation, disable animation for this frame
    if (progress < prevProgressRef.current) {
        setDisableAnim(true);
        // Re-enable animation on next tick/frame
        const id = requestAnimationFrame(() => setDisableAnim(false));
        return () => cancelAnimationFrame(id);
    }
    prevProgressRef.current = progress;
    }, [progress]);
  
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {title} state: {parsed.state}
          </Typography>
  
          {/* Only show iteration/time text when active  */}
          {isActive ? (
            <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {remainingUp}s remaining
              {parsed.maxIter > 0 ? ` • ${parsed.iter}/${parsed.maxIter}` : null}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {parsed.maxIter > 0 ? `${parsed.iter}/${parsed.maxIter}` : null}
            </Typography>
          )}
        </Box>
  
        {isActive ? (
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                "& .MuiLinearProgress-bar": {
                    transition: disableAnim ? "none" : undefined,
                },
                }}
            />
            ) : null}
      </Box>
    );
  }

export default function MidLevel(){

    const keywords = useKeywords([
        'tcc.PrimState',
        'tcc.SecState',
    ]);

    const { PrimState: primStatew, SecState: secStatew } = keywords;

    return (
        <Box display='flex' flexDirection='column' borderTop={1} p={2} pt={2}>
        <MountProgress title="Prim" values={primStatew?.values} />
        <MountProgress title="Sec" values={secStatew?.values} />
        </Box>
    );


}