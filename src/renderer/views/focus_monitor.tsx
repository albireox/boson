/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-02-18
 *  @Filename: focus_monitor.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, useTheme } from '@mui/material';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React from 'react';
import { useKeywords } from 'renderer/hooks';

function makeArr(startValue: number, stopValue: number, cardinality: number) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

export default function FocusMonitorView() {
  const [seriesData, setSeriesData] = React.useState<Highcharts.PointOptionsObject[]>([]);
  const [focusCurve, setFocusCurve] = React.useState<number[][]>([]);

  const [offset, setOffset] = React.useState<number | undefined>(undefined);

  const [xMinMax, setXMinMax] = React.useState<number[]>([-500.0, 500.0]);
  const [yMinMax, setYMinMax] = React.useState<number[]>([0.0, 2.0]);

  const xBuffer = 50;
  const yBuffer = 0.5;

  const theme = useTheme();
  const keywords = useKeywords(['cherno.focus_data', 'cherno.focus_fit']);

  const focus_data = keywords['cherno.focus_data'];
  const focus_fit = keywords['cherno.focus_fit'];

  React.useEffect(() => {
    if (focus_data) {
      if (focus_data.values.length === 1) {
        setSeriesData([]);
        setOffset(undefined);
      }

      const temp_series_data: Highcharts.PointOptionsObject[] = [];

      let ii = 1;

      let xMin = 0.0;
      let xMax = 0.0;
      let yMin = 0.0;
      let yMax = 0.0;

      while (true) {
        if (focus_data.values[ii] === undefined) break;

        const x = focus_data.values[ii + 2];
        const y = focus_data.values[ii + 1];

        temp_series_data.push({
          name: `GFA${focus_data.values[ii]}`,
          x: x,
          y: y
        });

        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;

        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;

        ii = ii + 3;
      }

      setSeriesData(temp_series_data);
      setXMinMax([xMin, xMax]);
      setYMinMax([yMin, yMax]);
    }
  }, [focus_data]);

  React.useEffect(() => {
    if (focus_fit) {
      const a: number = focus_fit.values[2];
      const b: number = focus_fit.values[3];
      const c: number = focus_fit.values[4];

      const x = makeArr(xMinMax[0] - xBuffer, xMinMax[1] + xBuffer, 1000);
      const yMicro = x.map((v) => a * v * v + b * v + c);

      setFocusCurve(x.map((_, idx) => [x[idx], yMicro[idx] / 2.889]));
      setOffset(-b / 2 / a);
    }
  }, [focus_fit, xMinMax]);

  const options: Highcharts.Options = {
    title: {
      text: 'Focus monitor',
      style: {
        color: theme.palette.secondary.main
      }
    },
    chart: {
      renderTo: 'container',
      backgroundColor: 'transparent',
      height: (9 / 16) * 100 + '%',
      zoomType: 'x'
    },
    xAxis: {
      title: {
        text: 'Offset',
        style: {
          color: theme.palette.text.primary
        }
      },
      labels: {
        format: '{value} &#181;m',
        style: {
          color: theme.palette.text.primary
        }
      },
      plotLines: [
        {
          color: theme.palette.text.disabled,
          width: 2,
          dashStyle: 'LongDash',
          value: offset
        }
      ],
      min: xMinMax[0] - xBuffer,
      max: xMinMax[1] + xBuffer
    },
    yAxis: [
      {
        title: {
          text: 'FWHM',
          style: {
            color: theme.palette.text.primary
          }
        },
        showEmpty: true,
        labels: {
          format: '{value} arcsec',
          style: {
            color: theme.palette.text.primary
          }
        },
        min: yMinMax[0],
        max: yMinMax[1] + yBuffer
      }
    ],

    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    series: [
      {
        // Just to show the chart even if the data is empty.
        type: 'scatter',
        yAxis: 0
      },
      {
        type: 'scatter',
        marker: {
          symbol: 'diamond',
          radius: 8,
          fillColor: theme.palette.primary.main
        },
        yAxis: 0,
        name: 'Focus data',
        tooltip: {
          pointFormat:
            'Camera: <b>{point.name}</b><br/>x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>'
        },
        data: seriesData
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
          valueSuffix: ' arcsec'
        }
      }
    ]
  };

  return (
    <Box height='100%' width='100%' alignSelf='center'>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Box>
  );
}
