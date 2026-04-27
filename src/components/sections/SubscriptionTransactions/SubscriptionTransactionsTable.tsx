import { ChangeEvent, ReactElement, useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Chip,
  Divider,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  debounce,
} from '@mui/material';
import { DataGrid, GridApi, GridColDef, GridSlots, useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { SubscriptionTransaction, subscriptionPlansService } from 'services/subscriptionPlans';

const getUserLabel = (tx: SubscriptionTransaction) => {
  const u = (tx as any).user || tx.user_id;
  if (u && typeof u === 'object') return u.name || u.email || u._id || u.id || 'N/A';
  return u ? String(u) : 'N/A';
};

const getPlanLabel = (tx: SubscriptionTransaction) => {
  const p = (tx as any).plan || tx.plan_id;
  if (p && typeof p === 'object') return p.plan_name || p.plan_id || p._id || p.id || 'N/A';
  return p ? String(p) : 'N/A';
};

const getAmountLabel = (tx: SubscriptionTransaction) => {
  const amount = (tx as any).amount ?? (tx as any).price ?? (tx as any).total ?? 0;
  const currency = (tx as any).currency ?? 'USD';
  return `${currency} ${Number(amount).toFixed(2)}`;
};

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'success':
    case 'succeeded':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'canceled':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const SubscriptionTransactionsTable = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionPlansService.getTransactions();
      setTransactions(data);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load subscription transactions';
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

  const columns: GridColDef<SubscriptionTransaction>[] = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 100 },
      {
        field: 'user',
        headerName: 'User',
        flex: 1.2,
        minWidth: 220,
        valueGetter: (_v, row) => getUserLabel(row),
      },
      {
        field: 'plan',
        headerName: 'Plan',
        flex: 1.1,
        minWidth: 200,
        valueGetter: (_v, row) => getPlanLabel(row),
      },
      {
        field: 'amount',
        headerName: 'Amount',
        flex: 0.7,
        minWidth: 140,
        valueGetter: (_v, row) => getAmountLabel(row),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.7,
        minWidth: 140,
        valueGetter: (_v, row) => (row.status ? String(row.status) : 'N/A'),
        renderCell: (params) => (
          <Chip
            label={params.row.status ?? 'N/A'}
            color={getStatusColor(params.row.status) as any}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Date',
        flex: 0.9,
        minWidth: 160,
        valueGetter: (_v, row) => {
          const dt = (row as any).createdAt || (row as any).created_at || (row as any).date;
          if (!dt) return 'N/A';
          const d = new Date(dt);
          return Number.isNaN(d.getTime()) ? String(dt) : d.toLocaleString();
        },
      },
    ],
    [],
  );

  const visibleColumns = useMemo(() => columns.filter((c) => c.field !== 'id'), [columns]);

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
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        padding={3.75}
        gap={2.25}
      >
        <Stack>
          <Typography variant="h5" color="text.primary">
            Subscription Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin view of subscription payments/charges
          </Typography>
        </Stack>
        <TextField
          variant="filled"
          placeholder="Search transactions..."
          id="search-input"
          name="transactions-search-input"
          onChange={handleSearchChange}
          value={search}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ width: 24, height: 24 }}>
                <IconifyIcon icon="mdi:search" width={1} height={1} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: { sm: 280 } }}
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
          rows={transactions}
          getRowId={(row) => String(row._id || row.id || Math.random())}
          getRowHeight={() => 56}
          hideFooterSelectedRowCount
          disableColumnResize
          disableColumnSelector
          disableRowSelectionOnClick
          rowSelection={false}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            columns: { columnVisibilityModel: { id: false } },
          }}
          pageSizeOptions={[10, 25, 50]}
          slots={{
            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
            noRowsOverlay: () => (
              <Stack justifyContent="center" alignItems="center" py={5}>
                <Typography variant="body2" color="text.secondary">
                  No transactions found
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

export default SubscriptionTransactionsTable;

