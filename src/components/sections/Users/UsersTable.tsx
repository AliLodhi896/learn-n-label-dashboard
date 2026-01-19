import { ChangeEvent, ReactElement, useMemo, useState, useEffect } from 'react';
import {
  Avatar,
  Divider,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  debounce,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridApi, GridColDef, GridSlots, useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { usersService, User } from 'services/users';
import UsersPagination from './UsersPagination';
import dotsIcon from 'assets/dots.png';

const UsersTable = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const userId = selectedUser._id || selectedUser.id;
      if (!userId) throw new Error('User ID not found');
      await usersService.suspendUser(userId);
      handleMenuClose();
      await fetchUsers();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to suspend user';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const userId = selectedUser._id || selectedUser.id;
      if (!userId) throw new Error('User ID not found');
      await usersService.unsuspendUser(userId);
      handleMenuClose();
      await fetchUsers();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to unsuspend user';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = () => {
    // Store the selected user before closing the menu
    const userToDelete = selectedUser;
    handleMenuClose();
    // Keep the selectedUser for the delete dialog
    setSelectedUser(userToDelete);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) {
      setError('No user selected for deletion');
      setDeleteDialogOpen(false);
      return;
    }
    try {
      setActionLoading(true);
      const userId = selectedUser._id || selectedUser.id;
      if (!userId) throw new Error('User ID not found');
      await usersService.deleteUser(userId);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to delete user';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDisplayStatus = (user: User) => {
    if (user.is_deleted) return 'Deleted';
    if (user.status?.toLowerCase() === 'suspended') return 'Suspended';
    return user.status || 'Active';
  };

  const isSuspended = (user: User) => {
    return user.status?.toLowerCase() === 'inactive';
  };

  const isActive = (user: User) => {
    return !user.is_deleted && user.status?.toLowerCase() !== 'inactive';
  };

  const columns: GridColDef<User>[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={params.row.profile_image}
              sx={{ width: 40, height: 40, objectFit: 'cover' }}
            >
              {params.row.name?.charAt(0)?.toUpperCase() || params.row.email?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Typography variant="body1" color="text.primary">
              {params.row.name || 'N/A'}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1,
        minWidth: 250,
      },
      {
        field: 'role',
        headerName: 'Role',
        flex: 0.75,
        minWidth: 150,
        valueGetter: (_value, row) => row.role || 'N/A',
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.75,
        minWidth: 150,
        valueGetter: (_value, row) => getDisplayStatus(row),
        renderCell: (params) => {
          const status = getDisplayStatus(params.row);
          const isActive = status.toLowerCase() === 'active';
          return (
            <Chip
              label={status}
              color={getStatusColor(status) as any}
              size="small"
              sx={
                isActive
                  ? {
                      backgroundColor: 'primary.light',
                      color: 'common.white',
                      '& .MuiChip-label': {
                        color: 'common.white',
                      },
                    }
                  : {}
              }
            />
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <IconButton
            onClick={(e) => handleMenuOpen(e, params.row)}
            disabled={actionLoading}
            size="small"
          >
            <img src={dotsIcon} alt="More actions" width={24} height={24} style={{ display: 'block' }} />
          </IconButton>
        ),
      },
    ],
    [actionLoading],
  );

  const visibleColumns = useMemo(
    () =>
      columns
        .filter((column) => column.field !== 'id')
        .map((column) => column),
    [columns],
  );

  const handleGridSearch = useMemo(() => {
    return debounce((searchValue) => {
      apiRef.current.setQuickFilterValues(
        searchValue.split(' ').filter((word: any) => word !== ''),
      );
    }, 250);
  }, [apiRef]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.currentTarget.value;
    setSearch(searchValue);
    handleGridSearch(searchValue);
  };

  return (
    <>
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
            Users
          </Typography>
          <TextField
            variant="filled"
            placeholder="Search users..."
            id="search-input"
            name="users-search-input"
            onChange={handleChange}
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
            rows={users}
            getRowId={(row) => {
              const id = row._id || row.id;
              if (!id) {
                console.error('User missing id:', row);
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
              pagination: UsersPagination,
              noRowsOverlay: () => (
                <Stack justifyContent="center" alignItems="center" py={5}>
                  <Typography variant="body2" color="text.secondary">
                    No users found
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
        {selectedUser && isSuspended(selectedUser) ? (
          <MenuItem onClick={handleUnsuspend} disabled={actionLoading}>
            <IconifyIcon icon="mdi:account-check" sx={{ mr: 1 }} />
            Unsuspend User
          </MenuItem>
        ) : selectedUser && isActive(selectedUser) ? (
          <MenuItem onClick={handleSuspend} disabled={actionLoading}>
            <IconifyIcon icon="mdi:account-off" sx={{ mr: 1 }} />
            Suspend User
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={handleDeleteClick}
          disabled={actionLoading}
          sx={{ color: 'error.main' }}
        >
          <IconifyIcon icon="mdi:delete" sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{selectedUser?.email}</strong>? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersTable;
