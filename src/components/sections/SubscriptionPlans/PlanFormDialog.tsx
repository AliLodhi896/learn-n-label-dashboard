import { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { SubscriptionPlan } from 'services/subscriptionPlans';

export type PlanFormMode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode: PlanFormMode;
  initialPlan?: Partial<SubscriptionPlan> | null;
  onClose: () => void;
  onSubmit: (plan: Partial<SubscriptionPlan>) => Promise<void> | void;
  submitting?: boolean;
};

const PlanFormDialog = ({
  open,
  mode,
  initialPlan,
  onClose,
  onSubmit,
  submitting = false,
}: Props): ReactElement => {
  const defaults = useMemo<Partial<SubscriptionPlan>>(
    () => ({
      plan_id: '',
      plan_name: '',
      description: '',
      price: 0,
      currency: 'USD',
      duration_days: 30,
      no_of_prompts: 0,
      features: [],
      is_active: true,
      is_popular: false,
      sort_order: 0,
    }),
    [],
  );

  const [form, setForm] = useState<Partial<SubscriptionPlan>>(defaults);
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    const next = { ...defaults, ...(initialPlan ?? {}) };
    setForm(next);
    setFeaturesText((next.features ?? []).join(', '));
  }, [defaults, initialPlan, open]);

  const title = mode === 'create' ? 'Create Subscription Plan' : 'Edit Subscription Plan';

  const handleSubmit = async () => {
    const features = featuresText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await onSubmit({
      ...form,
      features,
      price: Number(form.price ?? 0),
      duration_days: Number(form.duration_days ?? 0),
      no_of_prompts: Number(form.no_of_prompts ?? 0),
      sort_order: Number(form.sort_order ?? 0),
    });
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: (theme) => theme.shadows[24],
        },
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
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
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
            icon={mode === 'create' ? 'mdi:credit-card-plus-outline' : 'mdi:credit-card-edit-outline'}
            width={24}
            height={24}
            sx={{ color: 'white' }}
          />
        </Stack>
        <Stack>
          <Typography variant="h6" component="span" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {mode === 'create'
              ? 'Create a plan that users can subscribe to'
              : 'Update pricing, duration, features and visibility'}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2} pt={0.25}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.25}>
            <TextField
              label="Plan ID"
              value={form.plan_id ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, plan_id: e.target.value }))}
              fullWidth
              required
              size="small"
              disabled={mode === 'edit'}
              helperText={mode === 'edit' ? 'Plan ID cannot be changed' : ' '}
              placeholder="e.g. basic_monthly"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginTop: '0 !important' }}>
                    <IconifyIcon icon="mdi:identifier" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Plan Name"
              value={form.plan_name ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, plan_name: e.target.value }))}
              fullWidth
              required
              placeholder="e.g. Basic Plan"
              size="small"
              helperText=" "
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      marginTop: 0,
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginTop: '0 !important' }}>
                    <IconifyIcon icon="mdi:tag-outline" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Price"
              type="number"
              value={form.price ?? 0}
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              fullWidth
              required
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Enter price (0 for free plan)"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginTop: '0 !important' }}>
                    <IconifyIcon icon="mdi:currency-usd" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.25}>
            <TextField
              label="Currency"
              value={form.currency ?? 'USD'}
              onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
              fullWidth
              size="small"
              helperText="3-letter code (e.g. USD)"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginTop: '0 !important' }}>
                    <IconifyIcon icon="mdi:cash" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Duration (days)"
              type="number"
              value={form.duration_days ?? 30}
              onChange={(e) => setForm((p) => ({ ...p, duration_days: Number(e.target.value) }))}
              fullWidth
              required
              size="small"
              inputProps={{ min: 1, step: 1 }}
              helperText="How long the plan lasts"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginTop: '0 !important' }}>
                    <IconifyIcon icon="mdi:calendar-clock" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Sort order"
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
              fullWidth
              size="small"
              inputProps={{ step: 1 }}
              helperText="Lower shows first"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginTop: '0 !important' }}>
                    <IconifyIcon icon="mdi:sort-numeric-ascending" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.25}>
            <TextField
              label="Features (comma-separated)"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              fullWidth
              size="small"
              helperText="Example: Unlimited labels, Priority support, Team access"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginTop: '0 !important' }}>
                    <IconifyIcon icon="mdi:star-outline" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="No of AI Prompts"
              type="number"
              value={form.no_of_prompts ?? "0"}
              onChange={(e) => setForm((p) => ({ ...p, no_of_prompts: e.target.value }))}
              fullWidth
              size="small"
              inputProps={{ min: 0, step: 1 }}
              helperText="How many prompts included"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginTop: '0 !important' }}>
                    <IconifyIcon icon="mdi:robot-outline" width={20} height={20} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.is_active)}
                  onChange={(_e, checked) => setForm((p) => ({ ...p, is_active: checked }))}
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.is_popular)}
                  onChange={(_e, checked) => setForm((p) => ({ ...p, is_popular: checked }))}
                />
              }
              label="Popular"
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5 }}>
            Tip: Marking a plan as <strong>Popular</strong> can highlight it in your pricing UI. You can also disable a plan without deleting it.
          </Typography>
          <TextField
            label="Description"
            value={form.description ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            fullWidth
            size="small"
            multiline
            minRows={4}
            placeholder="Describe what’s included in this plan..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
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
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={submitting}
          startIcon={
            <IconifyIcon
              icon={mode === 'create' ? 'mdi:credit-card-plus-outline' : 'mdi:content-save'}
              width={18}
              height={18}
            />
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
          {mode === 'create' ? 'Create Plan' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanFormDialog;

