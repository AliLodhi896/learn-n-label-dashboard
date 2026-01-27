import { ChangeEvent, ReactElement, useMemo, useState, useEffect } from 'react';
import {
  Divider,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  debounce,
  Alert,
  Chip,
  Avatar,
} from '@mui/material';
import { DataGrid, GridApi, GridColDef, GridSlots, useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { userSubscriptionsService, UserSubscription } from 'services/userSubscriptions';
import SubscribersPagination from './SubscribersPagination';

const SubscribersTable = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userSubscriptionsService.getAllUserSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load subscribers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGridSearch = useMemo(() => {
    return debounce((searchValue: string) => {
      apiRef.current.setQuickFilterValues(
        searchValue.split(' ').filter((word: string) => word !== ''),
      );
    }, 250);
  }, [apiRef]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.currentTarget.value;
    setSearch(searchValue);
    handleGridSearch(searchValue);
  };

  const getStatusColor = (status?: string, hasActive?: boolean) => {
    // For active status, we'll use default and override with sx
    if (hasActive || status?.toLowerCase() === 'active') {
      return 'default';
    }
    switch (status?.toLowerCase()) {
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDuration = (subscription: UserSubscription) => {
    // If it's a trial, show 24 hrs
    if (subscription.subscription_type?.toLowerCase() === 'trial') {
      return '24 hrs';
    }
    
    // Otherwise use plan duration
    if (typeof subscription.plan === 'object' && subscription.plan) {
      if (subscription.plan.duration_days) {
        return `${subscription.plan.duration_days} days`;
      }
    }
    if (typeof subscription.plan_id === 'object' && subscription.plan_id) {
      const duration = (subscription.plan_id as any).duration_days;
      if (duration) {
        return `${duration} days`;
      }
    }
    return 'N/A';
  };

  const getUserName = (subscription: UserSubscription) => {
    if (typeof subscription.user === 'object' && subscription.user) {
      return subscription.user.name || subscription.user.email || 'N/A';
    }
    if (typeof subscription.user_id === 'object' && subscription.user_id) {
      return (subscription.user_id as any).name || (subscription.user_id as any).email || 'N/A';
    }
    return 'N/A';
  };

  const getUserEmail = (subscription: UserSubscription) => {
    if (typeof subscription.user === 'object' && subscription.user) {
      return subscription.user.email || 'N/A';
    }
    if (typeof subscription.user_id === 'object' && subscription.user_id) {
      return (subscription.user_id as any).email || 'N/A';
    }
    return 'N/A';
  };

  const getUserImage = (subscription: UserSubscription) => {
    if (typeof subscription.user === 'object' && subscription.user) {
      return subscription.user.profile_image;
    }
    if (typeof subscription.user_id === 'object' && subscription.user_id) {
      return (subscription.user_id as any).profile_image;
    }
    return undefined;
  };

  const getPlanName = (subscription: UserSubscription) => {
    // If it's a trial, show "Trial" in plan name
    if (subscription.subscription_type?.toLowerCase() === 'trial') {
      return 'Trial';
    }
    
    if (typeof subscription.plan === 'object' && subscription.plan) {
      return subscription.plan.plan_name || 'N/A';
    }
    if (typeof subscription.plan_id === 'object' && subscription.plan_id) {
      return (subscription.plan_id as any).plan_name || 'N/A';
    }
    return 'No Plan';
  };

  const getPlanPrice = (subscription: UserSubscription) => {
    if (typeof subscription.plan === 'object' && subscription.plan) {
      return subscription.plan.price ? `$${subscription.plan.price}` : 'N/A';
    }
    if (typeof subscription.plan_id === 'object' && subscription.plan_id) {
      const price = (subscription.plan_id as any).price;
      return price ? `$${price}` : 'N/A';
    }
    return 'N/A';
  };


  const columns: GridColDef<UserSubscription>[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
      },
      {
        field: 'user',
        headerName: 'User',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
          const name = getUserName(params.row);
          const email = getUserEmail(params.row);
          const image = getUserImage(params.row);
          
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={image}
                sx={{ width: 40, height: 40 }}
              >
                {name.charAt(0)?.toUpperCase() || email.charAt(0)?.toUpperCase()}
              </Avatar>
              <Stack>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {email}
                </Typography>
              </Stack>
            </Stack>
          );
        },
      },
      {
        field: 'plan_name',
        headerName: 'Plan Name',
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => getPlanName(row),
        renderCell: (params) => {
          const planName = getPlanName(params.row);
          return (
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              {planName}
            </Typography>
          );
        },
      },
      {
        field: 'plan_price',
        headerName: 'Price',
        flex: 0.75,
        minWidth: 100,
        valueGetter: (_value, row) => getPlanPrice(row),
      },
      {
        field: 'duration',
        headerName: 'Duration',
        flex: 0.75,
        minWidth: 120,
        valueGetter: (_value, row) => getDuration(row),
      },
      {
        field: 'payment_transaction_id',
        headerName: 'Transaction ID',
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => row.payment_transaction_id || 'N/A',
        renderCell: (params) => {
          const transactionId = params.row.payment_transaction_id;
          return (
            <Typography variant="body2" color="text.primary">
              {transactionId || 'N/A'}
            </Typography>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.75,
        minWidth: 120,
        valueGetter: (_value, row) => {
          if (row.has_active_subscription) return 'Active';
          return row.status || 'N/A';
        },
        renderCell: (params) => {
          const status = params.row.has_active_subscription ? 'Active' : (params.row.status || 'N/A');
          const isActive = params.row.has_active_subscription || status.toLowerCase() === 'active';
          return (
            <Chip
              label={status}
              color={getStatusColor(status, params.row.has_active_subscription) as any}
              size="small"
              sx={
                isActive
                  ? {
                      backgroundColor: '#FF8E2A',
                      color: 'white',
                      '& .MuiChip-label': {
                        color: 'white',
                      },
                    }
                  : {}
              }
            />
          );
        },
      },
      {
        field: 'subscription_start_date',
        headerName: 'Start Date',
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => {
          if (row.subscription_start_date) {
            return new Date(row.subscription_start_date).toLocaleDateString();
          }
          if (row.trial_start_date) {
            return new Date(row.trial_start_date).toLocaleDateString();
          }
          return 'N/A';
        },
      },
      {
        field: 'subscription_end_date',
        headerName: 'End Date',
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => {
          if (row.subscription_end_date) {
            return new Date(row.subscription_end_date).toLocaleDateString();
          }
          if (row.trial_end_date) {
            return new Date(row.trial_end_date).toLocaleDateString();
          }
          return 'N/A';
        },
      },
    ],
    [],
  );

  const visibleColumns = useMemo(
    () =>
      columns
        .filter((column) => column.field !== 'id')
        .map((column) => column),
    [columns],
  );

  return (
    <Stack
      bgcolor="background.paper"
      borderRadius={5}
      width={1}
      boxShadow={(theme) => theme.shadows[4]}
      height={1}
      minHeight={600}
    >
      <Stack
        direction={{ sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        padding={3.75}
        gap={3.75}
      >
        <Typography variant="h5" color="text.primary">
          Subscribers
        </Typography>
        <TextField
          variant="filled"
          placeholder="Search subscribers..."
          id="search-input"
          name="subscribers-search-input"
          onChange={handleSearchChange}
          value={search}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ width: 24, height: 24 }}>
                <IconifyIcon icon="mdi:search" width={1} height={1} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Stack>
      <Divider />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      <Stack height={1} width={1}>
        <DataGrid
          apiRef={apiRef}
          columns={visibleColumns}
          rows={subscriptions}
          getRowId={(row) => {
            const id = row._id || row.id;
            if (!id) {
              console.error('Subscription missing id:', row);
              return String(Math.random());
            }
            return String(id);
          }}
          getRowHeight={() => 70}
          hideFooterSelectedRowCount
          disableColumnResize
          disableColumnSelector
          disableRowSelectionOnClick
          rowSelection={false}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          pageSizeOptions={[5]}
          onResize={() => {
            apiRef.current.autosizeColumns({
              includeOutliers: true,
              expand: true,
            });
          }}
          slots={{
            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
            pagination: SubscribersPagination,
            noRowsOverlay: () => (
              <Stack justifyContent="center" alignItems="center" py={5}>
                <Typography variant="body2" color="text.secondary">
                  No subscribers found
                </Typography>
              </Stack>
            ),
          }}
          sx={{
            height: 1,
            width: 1,
            '& .MuiDataGrid-cell': {
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
            },
          }}
        />
      </Stack>
    </Stack>
  );
};

export default SubscribersTable;
