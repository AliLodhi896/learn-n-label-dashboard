import { ChangeEvent, ReactElement, useMemo, useState, useEffect } from 'react';
import {
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

const LabelsTable = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLabels();
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

  const handleDeleteClick = () => {
    const labelToDelete = selectedLabel;
    handleMenuClose();
    setSelectedLabel(labelToDelete);
    setDeleteDialogOpen(true);
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
          >
            <IconifyIcon icon="mdi:dots-vertical" />
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
        <MenuItem
          onClick={handleDeleteClick}
          disabled={actionLoading}
          sx={{ color: 'error.main' }}
        >
          <IconifyIcon icon="mdi:delete" sx={{ mr: 1 }} />
          Delete Label
        </MenuItem>
      </Menu>

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
