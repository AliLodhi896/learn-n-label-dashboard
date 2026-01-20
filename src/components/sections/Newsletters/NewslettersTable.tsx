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
import { newslettersService, Newsletter } from 'services/newsletters';
import NewslettersPagination from './NewslettersPagination';
import dotsIcon from 'assets/dots.png';

const NewslettersTable = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    const dataS = [
      {
        id: '1',
        newsletter_id: 'september-template',
        title: 'September-Newsletter',
        subject: 'Pre-Defined',
        status: 'Active',
      }
    ]
    setNewsletters(dataS);
    try {
      setLoading(true);
      setError(null);
      const data = await newslettersService.getAllNewsletters();

    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load newsletters';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  console.log(newsletters);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, newsletter: Newsletter) => {
    setAnchorEl(event.currentTarget);
    setSelectedNewsletter(newsletter);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNewsletter(null);
  };

  const handleDeleteClick = () => {
    const newsletterToDelete = selectedNewsletter;
    handleMenuClose();
    setSelectedNewsletter(newsletterToDelete);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNewsletter) {
      setError('No newsletter selected for deletion');
      setDeleteDialogOpen(false);
      return;
    }
    try {
      setActionLoading(true);
      const newsletterId = selectedNewsletter._id || selectedNewsletter.id;
      if (!newsletterId) throw new Error('Newsletter ID not found');
      await newslettersService.deleteNewsletter(newsletterId);
      setDeleteDialogOpen(false);
      setSelectedNewsletter(null);
      await fetchNewsletters();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to delete newsletter';
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

  const columns: GridColDef<Newsletter>[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
      },
      {
        field: 'newsletter_id',
        headerName: 'Newsletter ID',
        flex: 0.75,
        minWidth: 150,
        // valueGetter: (_value, row) => row.newsletter_id || row.id || 'N/A',
        valueGetter: () => 'september-template'
      },
      {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        minWidth: 200,
        // valueGetter: (_value, row) => row.newsletter_name || 'N/A',
        valueGetter: () => 'September-Newsletter'
      },
      {
        field: 'subject',
        headerName: 'Type',
        flex: 1,
        minWidth: 250,
        // valueGetter: (_value, row) => row.type || 'N/A
                valueGetter: () => 'Pre-Defined'
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.75,
        minWidth: 150,
        valueGetter: (_value, row) => row.status || 'N/A',
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
            Newsletters
          </Typography>
          <TextField
            variant="filled"
            placeholder="Search newsletters..."
            id="search-input"
            name="newsletters-search-input"
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
        {/* {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
            {error}
          </Alert>
        )} */}
        <Stack height={1} width={1}>
          <DataGrid
            apiRef={apiRef}
            columns={visibleColumns}
            rows={newsletters}
            getRowId={(row) => {
              const id = row._id || row.id;
              if (!id) {
                console.error('Newsletter missing id:', row);
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
              pagination: NewslettersPagination,
              noRowsOverlay: () => (
                <Stack justifyContent="center" alignItems="center" py={5}>
                  <Typography variant="body2" color="text.secondary">
                    No newsletters found
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
          Delete Newsletter
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Newsletter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete newsletter <strong>{selectedNewsletter?.title || selectedNewsletter?.subject || selectedNewsletter?.newsletter_id || 'this newsletter'}</strong>? This
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

export default NewslettersTable;
