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
} from '@mui/material';
import { DataGrid, GridApi, GridColDef, GridSlots, useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { labelsService, Label } from 'services/labels';
import LabelsPagination from './LabelsPagination';

const PredefinedLabels = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const data = await labelsService.getAllLabels();
      setLabels(data);
    } catch (error) {
      console.error('Failed to fetch labels:', error);
      setLabels([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef<Label>[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
      },
      {
        field: 'label_name',
        headerName: 'Label',
        flex: 1,
        minWidth: 182.9625,
        valueGetter: (_value, row) => row.label_name || row.name || 'N/A',
        renderCell: (params) => {
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              {params.row.label_image ? (
                <Avatar src={params.row.label_image} sx={{ width: 40, height: 40, objectFit: 'cover' }} />
              ) : (
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                  {params.row.label_name?.charAt(0)?.toUpperCase() || 'L'}
                </Avatar>
              )}
              <Stack direction="column" spacing={0.5} justifyContent="space-between">
                <Typography variant="body1" color="text.primary">
                  {params.row.label_name || params.row.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {params.row.label_id || params.row.id || 'N/A'}
                </Typography>
              </Stack>
            </Stack>
          );
        },
        sortComparator: (v1: string, v2: string) => v1.localeCompare(v2),
      },
      {
        field: 'label_id',
        headerName: 'Label ID',
        flex: 0.75,
        minWidth: 137.221875,
        valueGetter: (_value, row) => row.label_id || row.id || 'N/A',
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

  const handleGridSearch = useMemo(() => {
    return debounce((searchValue: string) => {
      apiRef.current.setQuickFilterValues(
        searchValue.split(' ').filter((word: string) => word !== ''),
      );
    }, 250);
  }, [apiRef]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.currentTarget.value;
    setSearch(searchValue);
    handleGridSearch(searchValue);
  };

  return (
    <Stack
      bgcolor="background.paper"
      borderRadius={5}
      width={1}
      boxShadow={(theme) => theme.shadows[4]}
      height={1}
    >
      <Stack
        direction={{ sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        padding={3.75}
        gap={3.75}
      >
        <Typography variant="h5" color="text.primary">
          Predefined Labels
        </Typography>
        <TextField
          variant="filled"
          placeholder="Search..."
          id="search-input"
          name="labels-search-input"
          onChange={handleChange}
          value={search}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ width: 24, height: 24 }}>
                <IconifyIcon icon="mdi:search" width={1} height={1} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Divider />
      <Stack height={1}>
        <DataGrid
          apiRef={apiRef}
          columns={visibleColumns}
          rows={labels}
          getRowId={(row) => {
            const id = row._id || row.id;
            if (!id) {
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
          }}
        />
      </Stack>
    </Stack>
  );
};

export default PredefinedLabels;
