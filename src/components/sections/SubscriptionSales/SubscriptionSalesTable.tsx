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
import SubscriptionSalesPagination from './SubscriptionSalesPagination';

const SubscriptionSalesTable = (): ReactElement => {
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
      
      // Filter out trial subscriptions
      const paidSubscriptions = data.filter(
        (sub) => sub.subscription_type?.toLowerCase() !== 'trial'
      );
      
      setSubscriptions(paidSubscriptions);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load subscriptions';
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

  const getSubscriptionTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'monthly':
        return 'primary';
      case 'yearly':
        return 'success';
      case 'lifetime':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status?: string, hasActive?: boolean) => {
    if (hasActive) return 'success';
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
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
    if (typeof subscription.plan === 'object' && subscription.plan) {
      return subscription.plan.plan_name || 'N/A';
    }
    if (typeof subscription.plan_id === 'object' && subscription.plan_id) {
      return (subscription.plan_id as any).plan_name || 'N/A';
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
        headerName: 'Plan',
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => getPlanName(row),
      },
      {
        field: 'subscription_type',
        headerName: 'Type',
        flex: 0.75,
        minWidth: 120,
        valueGetter: (_value, row) => row.subscription_type || 'N/A',
        renderCell: (params) => {
          const type = params.row.subscription_type;
          return (
            <Chip
              label={type || 'N/A'}
              color={getSubscriptionTypeColor(type) as any}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
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
          return (
            <Chip
              label={status}
              color={getStatusColor(status, params.row.has_active_subscription) as any}
              size="small"
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
          Subscribed Users (Paid Plans)
        </Typography>
        <TextField
          variant="filled"
          placeholder="Search subscriptions..."
          id="search-input"
          name="subscriptions-search-input"
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
            pagination: SubscriptionSalesPagination,
            noRowsOverlay: () => (
              <Stack justifyContent="center" alignItems="center" py={5}>
                <Typography variant="body2" color="text.secondary">
                  No subscriptions found
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

export default SubscriptionSalesTable;
