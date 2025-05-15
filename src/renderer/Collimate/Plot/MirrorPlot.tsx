/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-12-08
 *  @Filename: Focus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, CssBaseline, useTheme } from '@mui/material';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { round } from 'lodash';
import React from 'react';
import { useKeywordContext } from 'renderer/hooks';
import { useKeywords, useStore, useWindowSize } from 'renderer/hooks';

// type DataType = {
//   x: number;
//   y: number;
//   camera: string;
// };

export default function MirrorPlot() {

  const { AxePos: axePos } = useKeywordContext();
  const { TAI: tai } = useKeywordContext();

  const [mirrorAngle, setMirrorAngle] = React.useState<number>(0);

  const [gfa2SeriesData, setGfa2SeriesData] = React.useState<number[][]>([[0,0]]);
  const [gfa5SeriesData, setGfa5SeriesData] = React.useState<number[][]>([[0,0]]);


  React.useEffect(() => {
      if (!axePos) return;

      const rot: number = axePos.values[2];
      const ss = rot + 90.0;

      const ma: number = ss * Math.PI / 180.0;
      const x: number = Math.cos(ma) * 0.75;
      const y: number = Math.sin(ma) * 0.75;

      setMirrorAngle(Math.round(ma * 180 / Math.PI));
      setGfa2SeriesData([[x,y]]);

      const x2: number = Math.cos(ma+Math.PI) * 0.75;
      const y2: number = Math.sin(ma+Math.PI) * 0.75;
      setGfa5SeriesData([[x2,y2]]);


    }, [axePos]);

  const options: Highcharts.Options = {
      chart: {
        type: 'scatter',
        zoomType: 'xy',
        borderColor: '#000000', // Border color
        borderWidth: 2,       // Border width in pixels
        borderRadius: 5       // Border radius in pixels
      },
      title: {
        text: `GFA2 ang: ${mirrorAngle} deg <br> (view from focal plane to sky)`
      },
      xAxis: {
        title: {
          enabled: true,
          text: '+x mirror \u2192'
        },
        plotLines: [{
            value: 0,
            width: 2,
            color: 'black',
            zIndex: 10
        }],
        min: -1,
        max: 1,
        tickAmount: 0.5,
        gridLineWidth: 1,
        height: 250,
        width: 250,
        labels: {
          enabled: false, // Hide x-axis labels
        },
        tickLength: 0 // Hide x-axis tick marks
      },
      yAxis: {
        title: {
          text: '+y mirror \u2192'
        },
        min: -1,
        max: 1,
        tickAmount: 0.5,
        gridLineWidth: 1,
        height: 250,
        width: 250,
        plotLines: [{
            value: 0,
            width: 2,
            color: 'black',
            zIndex: 10
        }],
        labels: {
          enabled: false, // Hide x-axis labels
        },
        tickLength: 0 // Hide x-axis tick marks
      },
      series: [
        {
          name: 'GFA 2',
          data: gfa2SeriesData,
          // data: seriesData,
          marker: {
            symbol: 'square',
            radius: 10,
            lineColor: '#666666',
            lineWidth: 3,
            fillColor: '#FFFFFF'
          }
        },
        {
          name: 'GFA 5',
          data: gfa5SeriesData,
          // data: seriesData,
          marker: {
            symbol: 'triangle',
            radius: 10,
            lineColor: '#666666',
            lineWidth: 3,
            fillColor: '#FFFFFF'
          }
        },
        {
          name: 'Angle',
          data: [[0,0], gfa2SeriesData[0]],
          type: 'line',
          lineColor: '#666666',
          fillColor: '#FFFFFF',
          marker: {
            fillColor: "black"
          }
        }
      ],
  };

  return (
    <div style={{ width: '26%'}}>
    {/*// <div style={{ width: '240px' }}>*/}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
