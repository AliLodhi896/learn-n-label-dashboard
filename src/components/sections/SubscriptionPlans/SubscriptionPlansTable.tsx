import { ChangeEvent, ReactElement, useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  debounce,
} from '@mui/material';
import { DataGrid, GridApi, GridColDef, GridRenderCellParams, GridSlots, useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { SubscriptionPlan, subscriptionPlansService } from 'services/subscriptionPlans';
import PlanFormDialog from './PlanFormDialog';
import dotsIcon from 'assets/dots.png';

const SubscriptionPlansTable = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionPlansService.getAllPlans();
      setPlans(data);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load subscription plans';
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

  const openCreate = () => {
    setDialogMode('create');
    setSelectedPlan(null);
    setDialogOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setDialogMode('edit');
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, plan: SubscriptionPlan) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    const planToEdit = selectedPlan;
    handleMenuClose();
    if (planToEdit) openEdit(planToEdit);
  };

  const handleDeleteClick = async () => {
    const planToDelete = selectedPlan;
    handleMenuClose();
    if (!planToDelete) return;
    await handleDelete(planToDelete);
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    const planId = plan._id || plan.id || plan.plan_id;
    if (!planId) return;
    const ok = window.confirm(`Delete plan "${plan.plan_name}"?`);
    if (!ok) return;

    try {
      setSubmitting(true);
      setError(null);
      await subscriptionPlansService.deletePlan(String(planId));
      await fetchPlans();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to delete plan';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (data: Partial<SubscriptionPlan>) => {
    try {
      setSubmitting(true);
      setError(null);
      if (dialogMode === 'create') {
        await subscriptionPlansService.createPlan(data);
      } else {
        const planId = selectedPlan?._id || selectedPlan?.id || selectedPlan?.plan_id;
        if (!planId) throw { message: 'Missing plan id' };
        await subscriptionPlansService.updatePlan(String(planId), data);
      }
      setDialogOpen(false);
      await fetchPlans();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to save plan';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: GridColDef<SubscriptionPlan>[] = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 100 },
      {
        field: 'plan_id',
        headerName: 'Plan ID',
        flex: 1,
        minWidth: 160,
        valueGetter: (_v, row) => row.plan_id ?? row.id ?? 'N/A',
      },
      {
        field: 'plan_name',
        headerName: 'Name',
        flex: 1.25,
        minWidth: 200,
        valueGetter: (_v, row) => row.plan_name ?? 'N/A',
      },
      {
        field: 'price',
        headerName: 'Price',
        flex: 0.75,
        minWidth: 120,
        valueGetter: (_v, row) => `${row.currency || 'USD'} ${Number(row.price ?? 0).toFixed(2)}`,
      },
      {
        field: 'duration_days',
        headerName: 'Duration (days)',
        flex: 0.75,
        minWidth: 150,
        valueGetter: (_v, row) => row.duration_days ?? 'N/A',
      },
      {
        field: 'no_of_prompts',
        headerName: 'AI Prompts',
        flex: 0.7,
        minWidth: 120,
        valueGetter: (_v, row) => (row.no_of_prompts ?? "0"),
      },
      {
        field: 'is_active',
        headerName: 'Status',
        flex: 0.75,
        minWidth: 120,
        valueGetter: (_v, row) => (row.is_active ? 'Active' : 'Inactive'),
        renderCell: (params) => (
          <Chip
            label={params.row.is_active ? 'Active' : 'Inactive'}
            color={(params.row.is_active ? 'warning' : 'default') as any}
            size="small"
            sx={{ color: 'common.white' }}
          />
        ),
      },
      {
        field: 'is_popular',
        headerName: 'Popular',
        flex: 0.6,
        minWidth: 110,
        valueGetter: (_v, row) => (row.is_popular ? 'Yes' : 'No'),
        renderCell: (params) =>
          params.row.is_popular ? (
            <Chip label="Popular" color="primary" size="small" sx={{ color: 'common.white' }} />
          ) : null,
      },
      {
        field: 'sort_order',
        headerName: 'Sort',
        flex: 0.5,
        minWidth: 90,
        valueGetter: (_v, row) => row.sort_order ?? 0,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<SubscriptionPlan>) => {
          return (
            <IconButton
              onClick={(e) => handleMenuOpen(e, params.row)}
              disabled={submitting}
              size="small"
              aria-label="more actions"
            >
              <img src={dotsIcon} alt="More actions" width={24} height={24} style={{ display: 'block' }} />
            </IconButton>
          );
        },
      },
    ],
    [submitting],
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
            Subscription Plans
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update, and delete plans
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
          <TextField
            variant="filled"
            placeholder="Search plans..."
            id="search-input"
            name="plans-search-input"
            onChange={handleSearchChange}
            value={search}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ width: 24, height: 24 }}>
                  <IconifyIcon icon="mdi:search" width={1} height={1} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { sm: 260 } }}
          />
          <Button variant="contained" onClick={openCreate}>
            Create plan
          </Button>
        </Stack>
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
          rows={plans}
          getRowId={(row) => String(row._id || row.id || row.plan_id || Math.random())}
          getRowHeight={() => 62}
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
                  No plans found
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

      <PlanFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initialPlan={selectedPlan}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditClick} disabled={submitting}>
          <IconifyIcon icon="mdi:pencil" sx={{ mr: 1 }} />
          Edit Plan
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} disabled={submitting} sx={{ color: 'error.main' }}>
          <IconifyIcon icon="mdi:delete" sx={{ mr: 1 }} />
          Delete Plan
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default SubscriptionPlansTable;

