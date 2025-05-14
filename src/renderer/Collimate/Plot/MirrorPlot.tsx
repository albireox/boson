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

type DataType = {
  x: number;
  y: number;
  camera: string;
};

export default function MirrorPlot() {

  const { TCCPos: tccPos } = useKeywordContext();

  const [seriesData, setSeriesData] = React.useState<DataType[]>([]);

  const tempSeriesData: DataType[] = [];

  // tempSeriesData.push({
  //   camera: "GFA2",
  //   x: 0,
  //   y: 1,
  // });

  // tempSeriesData.push({
  //   camera: "GFA5",
  //   x: 0,
  //   y: -1,
  // });

  // setSeriesData(tempSeriesData);


  // const options: Highcharts.Options = {
  //   chart: {
  //     type: "scatter"
  //   },
  //   title: {
  //     text: "my scatter"
  //   },
  //   series: [
  //     {
  //       data: seriesData,
  //     }
  //   ]
  // }

  // const options: Highcharts.Options = {
  //   title: {
  //     text: 'Sample Chart'
  //   },
  //   series: [{
  //     type: 'line',
  //     data: [1, 2, 3, 4, 5],
  //     name: 'Sample Data'
  //   }]
  // };

  const options: Highcharts.Options = {
      chart: {
        type: 'scatter',
        zoomType: 'xy'
      },
      title: {
        text: 'view from focal plane'
      },
      xAxis: {
        title: {
          enabled: true,
          text: 'x mirror'
        },
        plotLines: [{
            value: 0,
            width: 2,
            color: 'black',
            zIndex: 10
        }],
        min: -1,
        max: 1,
        // tickAmount: 0.5,
        // gridLineWidth: 1,
        height: 200,
        width: 200,
        labels: {
          enabled: false, // Hide x-axis labels
        },
        tickLength: 0 // Hide x-axis tick marks
      },
      yAxis: {
        title: {
          text: 'y mirror'
        },
        min: -1,
        max: 1,
        // tickAmount: 0.5,
        // gridLineWidth: 1,
        height: 200,
        width: 200,
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
          data: [[0,.75]],
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
          data: [[0,-.75]],
          // data: seriesData,
          marker: {
            symbol: 'triangle',
            radius: 10,
            lineColor: '#666666',
            lineWidth: 3,
            fillColor: '#FFFFFF'
          }
        }
      ],
  };

  return (
    <div style={{ width: '25%' }}>
    {/*// <div style={{ width: '240px' }}>*/}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
