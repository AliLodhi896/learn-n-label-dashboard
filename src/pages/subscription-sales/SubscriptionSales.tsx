import { ReactElement, useEffect, useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { userSubscriptionsService, SubscriptionAnalytics } from 'services/userSubscriptions';
import SubscriptionSalesTable from 'components/sections/SubscriptionSales/SubscriptionSalesTable';
import { drawerWidth } from 'layouts/main-layout';

const SubscriptionSales = (): ReactElement => {
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userSubscriptionsService.getSubscriptionAnalytics();
      setAnalytics(data);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load subscription analytics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Stack
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Grid
      container
      component="main"
      columns={12}
      spacing={3.75}
      flexGrow={1}
      pt={4.375}
      pr={1.875}
      pb={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        pl: { xs: 3.75, lg: 0 },
      }}
    >
      <Grid xs={12} lg={12}>
        <Stack spacing={3.75} width="100%" mx="auto" maxWidth={1400}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {/* Analytics Cards */}
          <Grid container spacing={3.75}>
            <Grid xs={12} sm={12} md={12}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[4], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Subscriptions
                  </Typography>
                  <Typography variant="h4" color="text.primary" fontWeight={600}>
                    {analytics?.totalSubscriptions || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[4], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Subscriptions
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight={600}>
                    {analytics?.activeSubscriptions || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[4], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight={600}>
                    ${analytics?.totalRevenue?.toLocaleString() || '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[4], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monthly Subscriptions
                  </Typography>
                  <Typography variant="h4" color="text.primary" fontWeight={600}>
                    {analytics?.monthlySubscriptions || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[4], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Yearly Subscriptions
                  </Typography>
                  <Typography variant="h4" color="text.primary" fontWeight={600}>
                    {analytics?.yearlySubscriptions || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* Subscriptions Table */}
          <SubscriptionSalesTable />
        </Stack>
      </Grid>
    </Grid>

  );
};

export default SubscriptionSales;
