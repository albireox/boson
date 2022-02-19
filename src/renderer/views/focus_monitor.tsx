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
  const [fwhm, setFwhm] = React.useState<{ [key: string]: undefined | number }>({
    gfa1: undefined,
    gfa2: undefined,
    gfa3: undefined,
    gfa4: undefined,
    gfa5: undefined,
    gfa6: undefined
  });
  const [focusCurve, setFocusCurve] = React.useState<number[][] | undefined>(undefined);
  const [offset, setOffset] = React.useState<number | undefined>(undefined);

  const [currentExp, setCurrentExp] = React.useState<number>(-999);

  const theme = useTheme();
  const keywords = useKeywords(['cherno.fwhm_camera', 'cherno.focus_fit']);

  const fwhm_camera = keywords['cherno.fwhm_camera'];
  const focus_fit = keywords['cherno.focus_fit'];

  React.useEffect(() => {
    if (fwhm_camera) {
      if (fwhm_camera.values[1] !== currentExp) {
        setFwhm({
          gfa1: undefined,
          gfa2: undefined,
          gfa3: undefined,
          gfa4: undefined,
          gfa5: undefined,
          gfa6: undefined
        });
        setCurrentExp(fwhm_camera.values[1]);
      }
      setFwhm((f) => ({ ...f, [fwhm_camera.values[0]]: fwhm_camera.values[2] }));
    }
  }, [fwhm_camera, currentExp]);

  React.useEffect(() => {
    if (focus_fit) {
      const a: number = focus_fit.values[2];
      const b: number = focus_fit.values[3];
      const c: number = focus_fit.values[4];

      const x = makeArr(-400, 400, 1000);
      const yMicro = x.map((v) => a * v * v + b * v + c);
      const focus = x.map((_, idx) => [x[idx], yMicro[idx] / 2.889]);

      setFocusCurve(focus);
      setOffset(-b / 2 / a);
    }
  }, [focus_fit]);

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
      ]
    },
    yAxis: [
      {
        title: {
          text: 'FWHM',
          style: {
            color: theme.palette.text.primary
          }
        },
        labels: {
          format: '{value} arcsec',
          style: {
            color: theme.palette.text.primary
          }
        }
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
        type: 'scatter',
        name: 'GFA1',
        marker: {
          symbol: 'diamond',
          radius: 8,
          fillColor: theme.palette.primary.main
        },
        data: [[0, fwhm.gfa1]]
      },
      {
        type: 'scatter',
        name: 'GFA2',
        marker: {
          symbol: 'diamond',
          radius: 8,
          fillColor: theme.palette.primary.main
        },
        data: [[-375, fwhm.gfa2]]
      },
      {
        type: 'scatter',
        name: 'GFA3',
        marker: {
          symbol: 'diamond',
          radius: 8,
          fillColor: theme.palette.primary.main
        },
        data: [[-200, fwhm.gfa3]]
      },
      {
        type: 'scatter',
        name: 'GFA4',
        marker: {
          symbol: 'diamond',
          radius: 8,
          fillColor: theme.palette.primary.main
        },
        data: [[0, fwhm.gfa4]]
      },
      {
        type: 'scatter',
        name: 'GFA5',
        marker: {
          symbol: 'diamond',
          radius: 8,
          fillColor: theme.palette.primary.main
        },
        data: [[375, fwhm.gfa5]]
      },
      {
        type: 'scatter',
        name: 'GFA6',
        marker: {
          symbol: 'diamond',
          radius: 8,
          fillColor: theme.palette.primary.main
        },
        data: [[0, fwhm.gfa6]]
      },
      {
        type: 'line',
        name: 'Focus',
        yAxis: 0,
        color: theme.palette.secondary.main,
        data: focusCurve,
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
