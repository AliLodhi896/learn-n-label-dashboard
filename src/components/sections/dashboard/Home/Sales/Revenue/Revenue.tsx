import { ReactElement, useRef, useState, useEffect } from 'react';
import { Box, Button, Stack, Typography, useTheme, CircularProgress } from '@mui/material';
import EChartsReactCore from 'echarts-for-react/lib/core';
import RevenueChart from './RevenueChart';
import { LineSeriesOption } from 'echarts';
import { analyticsService, DashboardAnalytics } from 'services/analytics';

const Revenue = (): ReactElement => {
  const theme = useTheme();
  const chartRef = useRef<EChartsReactCore | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getDashboardAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics for chart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const lineChartColors = [theme.palette.secondary.main, theme.palette.primary.main];

  // Generate sample monthly data based on total subscription sales
  // In a real app, you'd fetch historical data from the API
  const generateMonthlyData = (total: number) => {
    // Distribute the total across 8 months with some variation
    const base = total / 8;
    return Array.from({ length: 8 }, () => {
      const variation = 0.3; // 30% variation
      const randomFactor = 1 + (Math.random() - 0.5) * variation;
      return Math.round(base * randomFactor);
    });
  };

  const subscriptionSalesData = analytics
    ? generateMonthlyData(analytics.total_subscription_sales)
    : [0, 0, 0, 0, 0, 0, 0, 0];

  const legendData = [
    { name: 'Subscription Sales', icon: 'circle' },
  ];

  const seriesData: LineSeriesOption[] = [
    {
      id: 1,
      data: subscriptionSalesData,
      type: 'line',
      smooth: true,
      color: lineChartColors[0],
      name: 'Subscription Sales',
      legendHoverLink: true,
      showSymbol: true,
      symbolSize: 12,
      lineStyle: {
        width: 5,
      },
      areaStyle: {
        opacity: 0.1,
      },
    },
  ];

  const onChartLegendSelectChanged = (name: string) => {
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance();
      instance.dispatchAction({
        type: 'legendToggleSelect',
        name: name,
      });
    }
  };

  const [revenueAdType, setRevenueAdType] = useState<any>({
    'Google ads': false,
    'Facebook ads': false,
  });

  const toggleClicked = (name: string) => {
    setRevenueAdType((prevState: any) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  return (
    <Stack
      bgcolor="common.white"
      borderRadius={5}
      minHeight={460}
      height={1}
      mx="auto"
      boxShadow={theme.shadows[4]}
    >
      <Stack
        direction={{ sm: 'row' }}
        justifyContent={{ sm: 'space-between' }}
        alignItems={{ sm: 'center' }}
        gap={2}
        padding={3.75}
      >
        <Typography variant="h5" color="text.primary">
          Subscription Sales
        </Typography>
        <Stack direction="row" gap={2}>
          {Array.isArray(seriesData) &&
            seriesData.map((dataItem, index) => (
              <Button
                key={dataItem.id}
                variant="text"
                onClick={() => {
                  toggleClicked(dataItem.name as string);
                  onChartLegendSelectChanged(dataItem.name as string);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  p: 0,
                  borderRadius: 1,
                  opacity: revenueAdType[`${dataItem.name}`] ? 0.5 : 1,
                }}
                disableRipple
              >
                {' '}
                <Stack direction="row" alignItems="center" gap={1} width={1}>
                  <Box
                    sx={{
                      width: 13,
                      height: 13,
                      bgcolor: revenueAdType[`${dataItem.name}`]
                        ? 'action.disabled'
                        : lineChartColors[index],
                      borderRadius: 400,
                    }}
                  ></Box>
                  <Typography variant="body2" color="text.secondary" flex={1} textAlign={'left'}>
                    {dataItem.name}
                  </Typography>
                </Stack>
              </Button>
            ))}
        </Stack>
      </Stack>
      <Box flex={1}>
        {loading ? (
          <Stack justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Stack>
        ) : (
          <RevenueChart
            chartRef={chartRef}
            sx={{ minHeight: 1 }}
            seriesData={seriesData}
            legendData={legendData}
            colors={lineChartColors}
          />
        )}
      </Box>
    </Stack>
  );
};

export default Revenue;
