import { SxProps, useTheme } from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts';
import EChartsReactCore from 'echarts-for-react/lib/core';
import { LineSeriesOption } from 'echarts';
import { useMemo } from 'react';
import { EChartsOption } from 'echarts-for-react';

type RevenueChartProps = {
  chartRef: React.MutableRefObject<EChartsReactCore | null>;
  seriesData?: LineSeriesOption[];
  legendData?: any;
  colors?: string[];
  sx?: SxProps;
};

const RevenueChart = ({ chartRef, seriesData, legendData, colors, ...rest }: RevenueChartProps) => {
  const theme = useTheme();

  // Calculate max value from series data for dynamic y-axis
  const maxValue = seriesData && seriesData.length > 0 && seriesData[0].data
    ? Math.max(...(seriesData[0].data as number[]))
    : 400;
  const yAxisMax = Math.ceil(maxValue * 1.2); // Add 20% padding

  const option: EChartsOption = useMemo(
    () => ({
      xAxis: {
        type: 'category',
        data: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'],
        boundaryGap: false,
        axisLine: {
          show: true,
          lineStyle: {
            color: theme.palette.divider,
            width: 1,
            type: 'dashed',
          },
        },
        axisLabel: {
          show: true,
          padding: 30,
          color: theme.palette.text.secondary,
          formatter: (value: any) => value.slice(0, 3),
          fontFamily: theme.typography.body2.fontFamily,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        max: yAxisMax,
        splitNumber: 4,
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: true,
          color: theme.palette.text.secondary,
          align: 'center',
          padding: [0, 20, 0, 0],
          fontFamily: theme.typography.body2.fontFamily,
          formatter: (value: any) => '$' + value.toLocaleString(),
        },
        splitLine: {
          interval: 5,
          lineStyle: {
            color: theme.palette.divider,
            width: 1,
            type: 'dashed',
          },
        },
      },
      grid: {
        left: 60,
        right: 30,
        top: 30,
        bottom: 90,
      },
      legend: {
        show: false,
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        valueFormatter: (value: any) => '$' + Number(value).toLocaleString(),
      },
      series: seriesData,
    }),
    [theme, yAxisMax, seriesData],
  );

  return <ReactEchart ref={chartRef} echarts={echarts} option={option} {...rest} />;
};

export default RevenueChart;
