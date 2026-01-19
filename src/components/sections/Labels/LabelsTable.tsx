import { ChangeEvent, ReactElement, useMemo, useState, useEffect } from 'react';
import {
  Box,
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
import { labelsService, Label } from 'services/labels';
import LabelsPagination from './LabelsPagination';
import dotsIcon from 'assets/dots.png';

const LabelsTable = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    label_name: '',
    label_image: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchLabels();
    console.log(imageFile);
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await labelsService.getAllLabels();
      setLabels(data);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load labels';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, label: Label) => {
    setAnchorEl(event.currentTarget);
    setSelectedLabel(label);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLabel(null);
  };

  const handleEditClick = () => {
    const labelToEdit = selectedLabel;
    if (labelToEdit) {
      const imageUrl = labelToEdit.label_image || '';
      setEditFormData({
        label_name: labelToEdit.label_name || labelToEdit.name || '',
        label_image: imageUrl,
      });
      setImagePreview(imageUrl || null);
      setImageFile(null);
    }
    handleMenuClose();
    setSelectedLabel(labelToEdit);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    const labelToDelete = selectedLabel;
    handleMenuClose();
    setSelectedLabel(labelToDelete);
    setDeleteDialogOpen(true);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setEditFormData((prev) => ({
          ...prev,
          label_image: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditConfirm = async () => {
    if (!selectedLabel) {
      setError('No label selected for editing');
      setEditDialogOpen(false);
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      const labelId = selectedLabel._id || selectedLabel.id;
      if (!labelId) throw new Error('Label ID not found');
      
      const updateData: { label_name?: string; label_image?: string } = {};
      if (editFormData.label_name) updateData.label_name = editFormData.label_name;
      if (editFormData.label_image) updateData.label_image = editFormData.label_image;
      
      await labelsService.updateLabel(labelId, updateData);
      setEditDialogOpen(false);
      setSelectedLabel(null);
      setEditFormData({ label_name: '', label_image: '' });
      setImagePreview(null);
      setImageFile(null);
      await fetchLabels();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to update label';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLabel) {
      setError('No label selected for deletion');
      setDeleteDialogOpen(false);
      return;
    }
    try {
      setActionLoading(true);
      const labelId = selectedLabel._id || selectedLabel.id;
      if (!labelId) throw new Error('Label ID not found');
      await labelsService.deleteLabel(labelId);
      setDeleteDialogOpen(false);
      setSelectedLabel(null);
      await fetchLabels();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to delete label';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
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

  const columns: GridColDef<Label>[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
      },
      {
        field: 'label_id',
        headerName: 'Label ID',
        flex: 0.75,
        minWidth: 150,
        valueGetter: (_value, row) => row.label_id || row.id || 'N/A',
      },
      {
        field: 'label_name',
        headerName: 'Label Name',
        flex: 1,
        minWidth: 200,
        valueGetter: (_value, row) => row.label_name || row.name || 'N/A',
      },
      {
        field: 'label_image',
        headerName: 'Image',
        flex: 0.75,
        minWidth: 150,
        renderCell: (params) => (
          <Stack direction="row" spacing={1} alignItems="center">
            {params.row.label_image ? (
              <img
                src={params.row.label_image}
                alt={params.row.label_name || 'Label'}
                style={{
                  width: 40,
                  height: 40,
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No Image
              </Typography>
            )}
          </Stack>
        ),
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
            aria-label="more actions"
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
            Labels
          </Typography>
          <TextField
            variant="filled"
            placeholder="Search labels..."
            id="search-input"
            name="labels-search-input"
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
            rows={labels}
            getRowId={(row) => {
              const id = row._id || row.id;
              if (!id) {
                console.error('Label missing id:', row);
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
              pagination: LabelsPagination,
              noRowsOverlay: () => (
                <Stack justifyContent="center" alignItems="center" py={5}>
                  <Typography variant="body2" color="text.secondary">
                    No labels found
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
        <MenuItem onClick={handleEditClick} disabled={actionLoading}>
          <IconifyIcon icon="mdi:pencil" sx={{ mr: 1 }} />
          Edit Label
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          disabled={actionLoading}
          sx={{ color: 'error.main' }}
        >
          <IconifyIcon icon="mdi:delete" sx={{ mr: 1 }} />
          Delete Label
        </MenuItem>
      </Menu>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
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
          }}
        >
          <IconifyIcon 
            icon="mdi:pencil-circle" 
            width={24} 
            height={24} 
            sx={{ color: 'primary.main' }} 
          />
          <Typography variant="h6" component="span" fontWeight={600}>
            Edit Label
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={3} mt={2}>
            <TextField
              label="Label Name"
              fullWidth
              variant="outlined"
              value={editFormData.label_name}
              onChange={(e) => handleEditFormChange('label_name', e.target.value)}
              disabled={actionLoading}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="mdi:label" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
                Label Image
              </Typography>
              
              {imagePreview ? (
                <Stack
                  spacing={2}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'action.focus',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        position: 'relative',
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: 2,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Label preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                    <Stack spacing={1} flex={1}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<IconifyIcon icon="mdi:image-edit" width={18} height={18} />}
                        disabled={actionLoading}
                        sx={{
                          width: 'fit-content',
                          borderRadius: 2,
                        }}
                      >
                        Change Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={actionLoading}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<IconifyIcon icon="mdi:delete-outline" width={18} height={18} />}
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setEditFormData((prev) => ({ ...prev, label_image: '' }));
                        }}
                        disabled={actionLoading}
                        sx={{
                          width: 'fit-content',
                          borderRadius: 2,
                        }}
                      >
                        Remove Image
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              ) : (
                <Stack
                  sx={{
                    border: 2,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 4,
                    bgcolor: 'action.focus',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<IconifyIcon icon="mdi:cloud-upload-outline" width={20} height={20} />}
                    disabled={actionLoading}
                    sx={{
                      width: '100%',
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                    }}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={actionLoading}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                    PNG, JPG or GIF (max. 5MB)
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            disabled={actionLoading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditConfirm}
            color="primary"
            variant="contained"
            disabled={actionLoading || !editFormData.label_name.trim()}
            startIcon={
              actionLoading ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : (
                <IconifyIcon icon="mdi:content-save" width={18} height={18} />
              )
            }
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              minWidth: 140,
            }}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Label</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete label <strong>{selectedLabel?.label_name || selectedLabel?.name || 'this label'}</strong>? This
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

export default LabelsTable;
