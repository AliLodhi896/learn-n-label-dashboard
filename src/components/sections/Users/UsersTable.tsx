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
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [addUserFormData, setAddUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    address?: string;
  }>({});

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
        field: 'subscription_plan',
        headerName: 'Subscription Plan',
        flex: 1,
        minWidth: 180,
        valueGetter: (_value, row) => {
          if (row.subscription?.plan?.plan_name) {
            return row.subscription.plan.plan_name;
          }
          return 'No Plan';
        },
        renderCell: (params) => {
          const planName = params.row.subscription?.plan?.plan_name;
          
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                {planName || 'Trial Period'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'subscription_status',
        headerName: 'Subscription Status',
        flex: 0.75,
        minWidth: 150,
        valueGetter: (_value, row) => {
          if (row.subscription?.status) {
            return row.subscription.status;
          }
          return 'None';
        },
        renderCell: (params) => {
          const subscriptionStatus = params.row.subscription?.subscription_type;
          const hasActiveSubscription = params.row.subscription?.has_active_subscription || params.row.has_active_subscription;
          
          if (!subscriptionStatus) {
            return (
              <Chip
                label="No Subscription"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            );
          }
          
          const statusColor = hasActiveSubscription ? 'success' : 
                             subscriptionStatus.toLowerCase() === 'expired' ? 'error' :
                             subscriptionStatus.toLowerCase() === 'trial' ? 'info' : 'default';
          
          return (
            <Chip
              label={subscriptionStatus}
              color={statusColor as any}
              size="small"
              // sx={{ fontSize: '0.75rem' }}
              sx={
                hasActiveSubscription
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long' };
    }
    return { valid: true };
  };

  const handleFormFieldChange = (field: string, value: string) => {
    setAddUserFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Real-time validation
    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setFormErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }
    
    if (field === 'password' && value) {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.valid) {
        setFormErrors(prev => ({ ...prev, password: passwordValidation.message }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!addUserFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(addUserFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!addUserFormData.password.trim()) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(addUserFormData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.message;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
          <Stack direction="row" spacing={2} alignItems="center">
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
            <Button
              variant="contained"
              startIcon={<IconifyIcon icon="mdi:account-plus" width={18} height={18} />}
              onClick={() => setAddUserDialogOpen(true)}
              sx={{ borderRadius: 10 }}
            >
              Add User
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

      <Dialog 
        open={addUserDialogOpen} 
        onClose={() => {
          setAddUserDialogOpen(false);
          setAddUserFormData({ name: '', email: '', password: '', address: '' });
          setFormErrors({});
          setError(null);
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[24],
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            pt: 3,
            px: 3,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
          }}
        >
          <Stack
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconifyIcon 
              icon="mdi:account-plus" 
              width={24} 
              height={24} 
              sx={{ color: 'white' }} 
            />
          </Stack>
          <Stack>
            <Typography variant="h6" component="span" fontWeight={600}>
              Add New User
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Create a new user account with subscription access
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)} 
              sx={{ mb: 3, borderRadius: 2 }}
              icon={<IconifyIcon icon="mdi:alert-circle" width={20} height={20} />}
            >
              {error}
            </Alert>
          )}
          <Stack spacing={3} mt={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Full Name"
                fullWidth
                variant="outlined"
                value={addUserFormData.name}
                onChange={(e) => handleFormFieldChange('name', e.target.value)}
                disabled={actionLoading}
                placeholder="Enter user's full name"
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon icon="mdi:account" width={20} height={20} sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Email Address"
                fullWidth
                variant="outlined"
                type="email"
                value={addUserFormData.email}
                onChange={(e) => handleFormFieldChange('email', e.target.value)}
                disabled={actionLoading}
                required
                placeholder="user@example.com"
                error={!!formErrors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon icon="mdi:email-outline" width={20} height={20} sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Password"
                fullWidth
                variant="outlined"
                type="password"
                value={addUserFormData.password}
                onChange={(e) => handleFormFieldChange('password', e.target.value)}
                disabled={actionLoading}
                required
                placeholder="Enter a secure password"
                error={!!formErrors.password}
                helperText={formErrors.password || 'Minimum 6 characters required'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon icon="mdi:lock-outline" width={20} height={20} sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Address"
                fullWidth
                variant="outlined"
                value={addUserFormData.address}
                onChange={(e) => handleFormFieldChange('address', e.target.value)}
                disabled={actionLoading}
                placeholder="Enter user's address (optional)"
                error={!!formErrors.address}
                helperText={formErrors.address || 'Optional: User physical address'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon icon="mdi:map-marker-outline" width={20} height={20} sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
          <Button 
            onClick={() => {
              setAddUserDialogOpen(false);
              setAddUserFormData({ name: '', email: '', password: '', address: '' });
              setFormErrors({});
              setError(null);
            }} 
            disabled={actionLoading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!validateForm()) {
                return;
              }
              try {
                setActionLoading(true);
                setError(null);
                await usersService.createUser({
                  name: addUserFormData.name || undefined,
                  email: addUserFormData.email.trim(),
                  password: addUserFormData.password,
                  address: addUserFormData.address || undefined,
                });
                setAddUserDialogOpen(false);
                setAddUserFormData({ name: '', email: '', password: '', address: '' });
                setFormErrors({});
                await fetchUsers();
              } catch (err) {
                const errorMessage =
                  err && typeof err === 'object' && 'message' in err
                    ? (err as { message: string }).message
                    : 'Failed to create user';
                setError(errorMessage);
              } finally {
                setActionLoading(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={actionLoading || !!formErrors.email || !!formErrors.password || !addUserFormData.email.trim() || !addUserFormData.password.trim()}
            startIcon={
              actionLoading ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : (
                <IconifyIcon icon="mdi:account-plus" width={18} height={18} />
              )
            }
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              minWidth: 140,
              boxShadow: (theme) => theme.shadows[4],
              '&:hover': {
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            {actionLoading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersTable;
