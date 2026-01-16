import { ReactElement, useMemo, useRef, useState, useEffect } from 'react';
import { Box, Button, Divider, Stack, Typography, useTheme, CircularProgress } from '@mui/material';
import EChartsReactCore from 'echarts-for-react/lib/core';
import { PieDataItemOption } from 'echarts/types/src/chart/pie/PieSeries.js';
import WebsiteVisitorsChart from './WebsiteVisitorsChart';
import { analyticsService, DashboardAnalytics } from 'services/analytics';

const WebsiteVisitors = (): ReactElement => {
  const theme = useTheme();
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

  // Get users distribution from API or calculate from total
  const getUsersDistribution = (analyticsData: DashboardAnalytics) => {
    const active = analyticsData.active_users ?? Math.round(analyticsData.total_users * 0.7);
    const suspended = analyticsData.suspended_users ?? Math.round(analyticsData.total_users * 0.2);
    const deleted = analyticsData.deleted_users ?? Math.round(analyticsData.total_users * 0.1);
    
    return [
      { value: active, name: 'Active Users' },
      { value: suspended, name: 'Suspended Users' },
      { value: deleted, name: 'Deleted Users' },
      { value: analyticsData.total_users, name: 'Total Users' },
    ];
  };

  const seriesData: PieDataItemOption[] = analytics
    ? getUsersDistribution(analytics)
    : [
        { value: 0, name: 'Active Users' },
        { value: 0, name: 'Suspended Users' },
        { value: 0, name: 'Deleted Users' },
        { value: 0, name: 'Total Users' },
      ];

  const legendData = [
    { name: 'Active Users', icon: 'circle' },
    { name: 'Suspended Users', icon: 'circle' },
    { name: 'Deleted Users', icon: 'circle' },
    { name: 'Total Users', icon: 'circle' },
  ];

  const pieChartColors = [
    theme.palette.success.main, // Active Users - green
    theme.palette.warning.main, // Suspended Users - orange/yellow
    theme.palette.error.main, // Deleted Users - red
    theme.palette.primary.main, // Total Users - blue
  ];

  const chartRef = useRef<EChartsReactCore | null>(null);
  const onChartLegendSelectChanged = (name: string) => {
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance();
      instance.dispatchAction({
        type: 'legendToggleSelect',
        name: name,
      });
    }
  };
  const [visitorType, setVisitorType] = useState<any>({
    'Active Users': false,
    'Suspended Users': false,
    'Deleted Users': false,
    'Total Users': false,
  });

  const toggleClicked = (name: string) => {
    setVisitorType((prevState: any) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };
  const totalVisitors = useMemo(
    () => {
      if (!analytics) return 0;
      // Total users is the sum of active, suspended, and deleted
      const active = analytics.active_users ?? Math.round(analytics.total_users * 0.7);
      const suspended = analytics.suspended_users ?? Math.round(analytics.total_users * 0.2);
      const deleted = analytics.deleted_users ?? Math.round(analytics.total_users * 0.1);
      return active + suspended + deleted;
    },
    [analytics],
  );

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 'min-content',
        boxShadow: theme.shadows[4],
      }}
    >
      <Typography variant="subtitle1" color="text.primary" p={2.5}>
        Users Distribution
      </Typography>
      {loading ? (
        <Stack justifyContent="center" alignItems="center" minHeight={300} p={2.5}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }}>
          <Stack direction="row" justifyContent="center" flex={'1 1 0%'}>
            <WebsiteVisitorsChart
              chartRef={chartRef}
              seriesData={seriesData}
              colors={pieChartColors}
              legendData={legendData}
              sx={{
                width: 222,
                maxHeight: 222,
                mx: 'auto',
              }}
            />
          </Stack>
        <Stack
          spacing={1}
          divider={<Divider />}
          sx={{ px: 2.5, py: 2.5 }}
          justifyContent="center"
          alignItems="stretch"
          flex={'1 1 0%'}
        >
          {Array.isArray(seriesData) &&
            seriesData.map((dataItem, index) => (
              <Button
                key={dataItem.name}
                variant="text"
                fullWidth
                onClick={() => {
                  toggleClicked(dataItem.name as string);
                  onChartLegendSelectChanged(dataItem.name as string);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  p: 0,
                  borderRadius: 1,
                  opacity: visitorType[`${dataItem.name}`] ? 0.5 : 1,
                }}
                disableRipple
              >
                <Stack direction="row" alignItems="center" gap={1} width={1}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      bgcolor: visitorType[`${dataItem.name}`]
                        ? 'action.disabled'
                        : pieChartColors[index],
                      borderRadius: 400,
                    }}
                  ></Box>
                  <Typography variant="body1" color="text.secondary" flex={1} textAlign={'left'}>
                    {dataItem.name}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {dataItem.name === 'Total Users' 
                      ? (dataItem.value ?? 0).toLocaleString()
                      : totalVisitors > 0 
                        ? ((parseInt(`${dataItem.value ?? 0}`) / totalVisitors) * 100).toFixed(0) + '%'
                        : '0%'}
                  </Typography>
                </Stack>
              </Button>
            ))}
        </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default WebsiteVisitors;
