import { Stack, CircularProgress, Alert } from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';
import SaleInfo from './SaleInfo';
import { analyticsService, DashboardAnalytics } from 'services/analytics';
import avgRevenue from 'assets/sale-info/avg-revenue.png';
import customers from 'assets/sale-info/customers.png';
import sales from 'assets/sale-info/sales.png';

interface AnalyticsCard {
  id: number;
  image: string;
  title: string;
  sales: number;
  increment: number;
  date: string;
}

const SaleInfoCards = (): ReactElement | null => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        const errorMessage =
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : 'Failed to load analytics';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Stack direction={{ sm: 'row' }} justifyContent="center" alignItems="center" gap={3.75} minHeight={200}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack direction={{ sm: 'row' }} gap={3.75}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Stack>
    );
  }

  if (!analytics) {
    return null;
  }

  // Map analytics data to cards
  const analyticsCards: (AnalyticsCard & { formatAsCurrency?: boolean })[] = [
    {
      id: 1,
      image: sales,
      title: 'Subscription Sales',
      sales: analytics.total_subscription_sales,
      increment: 0, // API doesn't provide increment, can be calculated later if needed
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      formatAsCurrency: true,
    },
    {
      id: 2,
      image: customers,
      title: 'Total Users',
      sales: analytics.total_users,
      increment: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      formatAsCurrency: false,
    },
    {
      id: 3,
      image: avgRevenue,
      title: 'Labels',
      sales: analytics.total_predefined_labels,
      increment: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      formatAsCurrency: false,
    },
    {
      id: 4,
      image: avgRevenue, // Reusing image, can be replaced with a templates-specific image later
      title: 'Templates',
      sales: analytics.total_predefined_templates,
      increment: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      formatAsCurrency: false,
    },
  ];

  return (
    <Stack direction={{ sm: 'row' }} justifyContent={{ sm: 'space-between' }} gap={3.75}>
      {analyticsCards.map((card) => (
        <SaleInfo
          key={card.id}
          title={card.title}
          image={card.image}
          sales={card.sales}
          increment={card.increment}
          date={card.date}
          formatAsCurrency={card.formatAsCurrency}
        />
      ))}
    </Stack>
  );
};

export default SaleInfoCards;
