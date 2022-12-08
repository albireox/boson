/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-08
 *  @Filename: Focus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline, useTheme } from '@mui/material';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React from 'react';
import { useKeywords, useWindowSize } from 'renderer/hooks';

function makeArr(startValue: number, stopValue: number, cardinality: number) {
  const arr = [];
  const step = (stopValue - startValue) / (cardinality - 1);
  for (let i = 0; i < cardinality; i += 1) {
    arr.push(startValue + step * i);
  }
  return arr;
}

type DataType = Highcharts.PointOptionsObject[];

export default function FocusPlot() {
  const [seriesData, setSeriesData] = React.useState<DataType[]>([]);
  const [focusCurve, setFocusCurve] = React.useState<number[][]>([]);

  const [offset, setOffset] = React.useState<number | undefined>(undefined);

  const [xMinMax, setXMinMax] = React.useState<number[]>([-500.0, 500.0]);
  const [yMinMax, setYMinMax] = React.useState<number[]>([0.0, 2.0]);

  const { height } = useWindowSize();

  const xBuffer = 50;
  const yBuffer = 0.5;

  const theme = useTheme();
  const { focus_data: focusData, focus_fit: focusFit } = useKeywords('cherno', [
    'focus_data',
    'focus_fit',
  ]);

  React.useEffect(() => {
    if (!focusData) return;

    if (focusData.values.length === 1) {
      setSeriesData([]);
      setOffset(undefined);
    }

    const tempSeriesData: Highcharts.PointOptionsObject[] = [];

    let xMin = 0.0;
    let xMax = 0.0;
    let yMin = 0.0;
    let yMax = 0.0;

    for (let ii = 1; ii <= focusData.values.length; ii += 3) {
      if (focusData.values[ii] === undefined) break;

      const x = focusData.values[ii + 2];
      const y = focusData.values[ii + 1];

      tempSeriesData.push({
        name: `GFA${focusData.values[ii]}`,
        x,
        y,
      });

      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;

      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }

    setSeriesData(tempSeriesData);
    setXMinMax([xMin, xMax]);
    setYMinMax([yMin, yMax]);
  }, [focusData]);

  React.useEffect(() => {
    if (!focusFit) return;

    const a: number = focusFit.values[2];
    const b: number = focusFit.values[3];
    const c: number = focusFit.values[4];

    const x = makeArr(xMinMax[0] - xBuffer, xMinMax[1] + xBuffer, 1000);
    const yMicro = x.map((v) => a * v * v + b * v + c);

    setFocusCurve(x.map((_, idx) => [x[idx], yMicro[idx]]));
    setOffset(-b / 2 / a);
  }, [focusFit, xMinMax]);

  const options: Highcharts.Options = {
    title: {
      text: undefined,
    },
    chart: {
      renderTo: 'container',
      backgroundColor: 'transparent',
      height: (height ?? 400) - 48,
      zooming: {
        type: 'x',
      },
    },
    xAxis: {
      title: {
        text: 'Offset',
        style: {
          color: theme.palette.text.primary,
        },
      },
      labels: {
        format: '{value} &#181;m',
        style: {
          color: theme.palette.text.primary,
        },
      },
      plotLines: [
        {
          color: theme.palette.text.disabled,
          width: 2,
          dashStyle: 'LongDash',
          value: offset,
        },
      ],
      min: xMinMax[0] - xBuffer,
      max: xMinMax[1] + xBuffer,
    },
    yAxis: [
      {
        title: {
          text: 'FWHM',
          style: {
            color: theme.palette.text.primary,
          },
        },
        showEmpty: true,
        labels: {
          format: '{value} arcsec',
          style: {
            color: theme.palette.text.primary,
          },
        },
        min: yMinMax[0],
        max: yMinMax[1] + yBuffer,
      },
    ],

    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        // Just to show the chart even if the data is empty.
        type: 'scatter',
        yAxis: 0,
      },
      {
        type: 'scatter',
        marker: {
          symbol: 'diamond',
          radius: 8,
          fillColor: theme.palette.primary.main,
        },
        yAxis: 0,
        name: 'Focus data',
        tooltip: {
          pointFormat:
            'Camera: <b>{point.name}</b><br/>x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>',
        },
        data: seriesData,
      },
      {
        type: 'line',
        name: 'Focus',
        yAxis: 0,
        color: theme.palette.secondary.main,
        data: focusCurve,
        marker: { enabled: false },
        tooltip: {
          valueDecimals: 2,
          valueSuffix: ' arcsec',
        },
      },
    ],
  };

  return (
    <Box component='main' height='100%'>
      <CssBaseline />
      <Box p={4} height='100%'>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Box>
    </Box>
  );
}
