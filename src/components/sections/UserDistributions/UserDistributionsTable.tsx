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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridApi, GridColDef, GridSlots, useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { notificationsService, Notification } from 'services/notifications';
import UserDistributionsPagination from './UserDistributionsPagination';

const UserDistributionsTable = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'label' | 'newsletter'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, itemTypeFilter, search]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsService.getAllNotifications();
      console.log('data',data)
      setNotifications(data);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load user distributions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Filter by item type
    if (itemTypeFilter !== 'all') {
      filtered = filtered.filter(
        (notification) => notification.type?.toLowerCase() === itemTypeFilter.toLowerCase()
      );
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((notification) => {
        const userName = getUserName(notification).toLowerCase();
        const userEmail = getUserEmail(notification).toLowerCase();
        const itemName = getItemName(notification).toLowerCase();
        return (
          userName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          itemName.includes(searchLower)
        );
      });
    }

    setFilteredNotifications(filtered);
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

  const handleItemTypeFilterChange = (value: 'all' | 'label' | 'newsletter') => {
    setItemTypeFilter(value);
  };

  const getUserName = (notification: Notification) => {
    if (typeof notification.user === 'object' && notification.user) {
      return notification.user.name || notification.user.email || 'N/A';
    }
    if (typeof notification.user_id === 'object' && notification.user_id) {
      return (notification.user_id as any).name || (notification.user_id as any).email || 'N/A';
    }
    return 'N/A';
  };

  const getUserEmail = (notification: Notification) => {
    if (typeof notification.user === 'object' && notification.user) {
      return notification.user.email || 'N/A';
    }
    if (typeof notification.user_id === 'object' && notification.user_id) {
      return (notification.user_id as any).email || 'N/A';
    }
    return 'N/A';
  };

  const getItemName = (notification: Notification) => {
    if (notification.type === 'label' && notification.label) {
      return notification.label.label_name || 'N/A';
    } else if (notification.type === 'newsletter' && notification.newsletter) {
      return notification.newsletter.title || notification.newsletter.subject || 'N/A';
    }
    // Fallback to title if available
    if (notification.title) {
      return notification.title;
    }
    return 'N/A';
  };

  const getItemImage = (notification: Notification) => {
    if (notification.type === 'label' && notification.label) {
      return notification.label.label_image;
    }
    return undefined;
  };

  const getItemTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'label':
        return 'primary';
      case 'newsletter':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns: GridColDef<Notification>[] = useMemo(
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
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={params.row.label?.labels?.[0]?.label_image}
                sx={{ width: 40, height: 40 }}
              >
              </Avatar>
              <Stack>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  {params.row.label?.label_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                {params.row.label?.type}
                </Typography>
              </Stack>
            </Stack>
          );
        },
      },
      {
        field: 'type',
        headerName: 'Type',
        flex: 0.75,
        minWidth: 120,
        valueGetter: (_value, row) => row.type || 'N/A',
        renderCell: (params) => {
          const type = params.row.type;
          return (
            <Chip
              label={type || 'N/A'}
              color={getItemTypeColor(type) as any}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'item_name',
        headerName: 'Item Name',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
          const itemName = getItemName(params.row);
          const itemImage = getItemImage(params.row);
          const itemType = params.row.type;
          
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              {itemImage && itemType === 'label' && (
                <Avatar
                  src={itemImage}
                  variant="rounded"
                  sx={{ width: 40, height: 40 }}
                >
                  <IconifyIcon icon="mdi:label" width={20} height={20} />
                </Avatar>
              )}
              {!itemImage && itemType === 'label' && (
                <Avatar
                  variant="rounded"
                  sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}
                >
                  <IconifyIcon icon="mdi:label" width={20} height={20} sx={{ color: 'white' }} />
                </Avatar>
              )}
              {itemType === 'newsletter' && (
                <Avatar
                  variant="rounded"
                  sx={{ width: 40, height: 40, bgcolor: 'info.light' }}
                >
                  <IconifyIcon icon="mdi:email-newsletter" width={20} height={20} sx={{ color: 'white' }} />
                </Avatar>
              )}
              {!itemType && (
                <Avatar
                  variant="rounded"
                  sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}
                >
                  <IconifyIcon icon="mdi:file" width={20} height={20} sx={{ color: 'white' }} />
                </Avatar>
              )}
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                {itemName}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'sender',
        headerName: 'Shared By',
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => {
          if (row.sender) {
            return row.sender.name || row.sender.email || 'N/A';
          }
          return 'N/A';
        },
        renderCell: (params) => {
          const sender = params.row.sender;
          if (sender) {
            return (
              <Stack direction="row" spacing={1} alignItems="center">
                {sender.profile_image && (
                  <Avatar src={sender.profile_image} sx={{ width: 32, height: 32 }} />
                )}
                {!sender.profile_image && (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {(sender.name || sender.email || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                )}
                <Typography variant="body2" color="text.primary">
                  {sender.name || sender.email || 'N/A'}
                </Typography>
              </Stack>
            );
          }
          return <Typography variant="body2" color="text.secondary">N/A</Typography>;
        },
      },
      {
        field: 'createdAt',
        headerName: 'Shared Date',
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => {
          if (row.created_at) {
            return new Date(row.created_at).toLocaleDateString();
          }
          if (row.createdAt) {
            return new Date(row.createdAt).toLocaleDateString();
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

  console.log('filteredNotifications',filteredNotifications)     
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
          User Distributions
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={itemTypeFilter}
              onChange={(e) => handleItemTypeFilterChange(e.target.value as 'all' | 'label' | 'newsletter')}
              label="Filter by Type"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="label">Labels</MenuItem>
              <MenuItem value="newsletter">Newsletters</MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="filled"
            placeholder="Search distributions..."
            id="search-input"
            name="distributions-search-input"
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
          rows={filteredNotifications}
          getRowId={(row) => {
            const id = row._id || row.id;
            if (!id) {
              console.error('Notification missing id:', row);
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
            pagination: UserDistributionsPagination,
            noRowsOverlay: () => (
              <Stack justifyContent="center" alignItems="center" py={5}>
                <Typography variant="body2" color="text.secondary">
                  No distributions found
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

export default UserDistributionsTable;
