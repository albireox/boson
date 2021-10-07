/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-28
 *  @Filename: weather.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useTheme } from '@mui/material';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from 'react';
import { useKeywords } from 'renderer/hooks';

const classes = {
  root: {
    height: '100%',
    width: '100%',
    padding: '10px'
  }
};

export default function WeatherView() {
  const theme = useTheme();

  const keywords = useKeywords(['apo.airTempPT', 'apo.humidPT'], 'weather-plot');

  const [temperature, setTemperature] = useState<
    {
      x: number;
      y: number;
    }[]
  >([]);

  const [humidity, setHumidity] = useState<
    {
      x: number;
      y: number;
    }[]
  >([]);

  useEffect(() => {
    if (keywords['apo.airTempPT'] === undefined) return;
    if (keywords['apo.humidPT'] === undefined) return;

    setTemperature((prev) => [
      ...prev,
      {
        x: keywords['apo.airTempPT'].lastSeenAt.getTime(),
        y: keywords['apo.airTempPT'].values[0]
      }
    ]);
    setHumidity((prev) => [
      ...prev,
      {
        x: keywords['apo.humidPT'].lastSeenAt.getTime(),
        y: keywords['apo.humidPT'].values[0]
      }
    ]);
  }, [keywords]);

  const options: Highcharts.Options = {
    title: {
      text: 'Weather',
      style: {
        color: theme.palette.secondary.main
      }
    },
    chart: {
      renderTo: 'container',
      backgroundColor: 'transparent',
      height: (9 / 16) * 100 + '%',
      style: {
        color: 'red'
      },
      zoomType: 'x'
    },
    xAxis: {
      type: 'datetime',
      labels: {
        style: {
          color: theme.palette.text.primary
        }
      }
    },
    yAxis: [
      {
        title: {
          text: 'Temperature',
          style: {
            color: theme.palette.text.primary
          }
        },
        labels: {
          format: '{value}°C',
          style: {
            color: theme.palette.text.primary
          }
        }
      },
      {
        title: {
          text: 'Humidity',
          style: {
            color: theme.palette.text.primary
          }
        },
        labels: {
          format: '{value}%',
          style: {
            color: theme.palette.text.primary
          }
        },
        opposite: true
      }
    ],
    legend: {
      itemStyle: {
        color: theme.palette.text.primary
      }
    },
    series: [
      {
        type: 'line',
        name: 'Temperature',
        yAxis: 0,
        data: temperature,
        tooltip: {
          valueSuffix: '°C'
        }
      },
      {
        type: 'line',
        name: 'Humidity',
        yAxis: 1,
        color: theme.palette.secondary.main,
        data: humidity,
        tooltip: {
          valueSuffix: ' %'
        }
      }
    ]
  };

  return (
    <div css={classes.root}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
