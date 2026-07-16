import { ReactElement, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  useTheme,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Switch,
  Autocomplete,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import { drawerWidth } from 'layouts/main-layout';
import IconifyIcon from 'components/base/IconifyIcon';
import RichTextEditor from 'components/sections/Settings/ClassicEditor';
import { settingsService, Setting, SettingType } from 'services/settings';
import {
  maintenanceService,
  MaintenanceSettings,
} from 'services/maintenance';
import { usersService, User } from 'services/users';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatPreviewEndsAt(iso: string | null): string {
  if (!iso) return 'No end time set';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'No end time set';
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const Settings = (): ReactElement => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const BRAND_GREEN = theme.palette.primary.main;
  const BRAND_DARK = isDark ? '#12160E' : '#1a1f0a';
  const ON_DARK = '#F2F4EA';
  const PAGE_CREAM = isDark ? theme.palette.background.default : '#eef1e4';
  const PANEL = isDark ? 'rgba(255,255,255,0.04)' : '#f7f8f1';
  const BORDER = theme.palette.divider;
  const BODY = theme.palette.text.primary;
  const MUTED = theme.palette.text.secondary;
  const SURFACE = theme.palette.background.paper;

  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<Record<SettingType, Setting | null>>({
    privacy_policy: null,
    terms_and_conditions: null,
    about_us: null,
  });
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({
    enabled: false,
    reason: '',
    ends_at: null,
    allowed_user_ids: [],
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const settingTypes: SettingType[] = ['privacy_policy', 'terms_and_conditions', 'about_us'];
  const tabLabels = ['Privacy Policy', 'Terms and Conditions', 'About Us', 'App Maintenance'];
  const maintenanceTabIndex = 3;

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allSettings, maintenanceData, users] = await Promise.all([
        settingsService.getAllSettings(),
        maintenanceService.getMaintenance().catch(() => null),
        usersService.getAllUsers().catch(() => [] as User[]),
      ]);

      const settingsMap: Record<SettingType, Setting | null> = {
        privacy_policy: null,
        terms_and_conditions: null,
        about_us: null,
      };

      allSettings.forEach((setting) => {
        if (setting.type && settingTypes.includes(setting.type)) {
          settingsMap[setting.type] = setting;
        }
      });

      setSettings(settingsMap);
      setAllUsers(users.filter((u) => !u.is_deleted));

      if (maintenanceData) {
        setMaintenance(maintenanceData);
      }
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to load settings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedAllowedUsers = useMemo(() => {
    const idSet = new Set(maintenance.allowed_user_ids.map(String));
    return allUsers.filter((u) => idSet.has(String(u.id || u._id)));
  }, [allUsers, maintenance.allowed_user_ids]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleTitleChange = (type: SettingType, title: string) => {
    setSettings((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || { type, title: '', content: '' }),
        title,
      },
    }));
  };

  const handleContentChange = (type: SettingType, content: string) => {
    setSettings((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || { type, title: '', content: '' }),
        content,
      },
    }));
  };

  const handleSave = async (type: SettingType) => {
    const setting = settings[type];
    if (!setting) {
      setError('Setting data is missing');
      return;
    }

    if (!setting.title.trim() || !setting.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (setting.id || setting._id) {
        await settingsService.updateSetting(type, {
          title: setting.title,
          content: setting.content,
        });
        setSuccess(`${tabLabels[settingTypes.indexOf(type)]} updated successfully`);
      } else {
        await settingsService.createSetting({
          type,
          title: setting.title,
          content: setting.content,
        });
        setSuccess(`${tabLabels[settingTypes.indexOf(type)]} created successfully`);
      }

      await fetchAllSettings();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to save setting';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      setSavingMaintenance(true);
      setError(null);
      setSuccess(null);

      if (maintenance.enabled && !maintenance.reason.trim()) {
        setError('Please provide a maintenance reason/description');
        return;
      }

      const updated = await maintenanceService.updateMaintenance({
        enabled: maintenance.enabled,
        reason: maintenance.reason.trim(),
        ends_at: maintenance.ends_at,
        allowed_user_ids: maintenance.allowed_user_ids,
      });

      setMaintenance(updated);
      setSuccess(
        updated.enabled
          ? 'App maintenance mode enabled'
          : 'App maintenance settings saved'
      );
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to save maintenance settings';
      setError(errorMessage);
    } finally {
      setSavingMaintenance(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          pt: 4.375,
          pr: 1.875,
          pb: 0,
          pl: { xs: 3.75, lg: 0 },
        }}
      >
        <Stack justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { md: `100%` },
        pt: 4.375,
        pr: 1.875,
        pb: 0,
        pl: { xs: 3.75, lg: 0 },
      }}
    >
      <Stack spacing={3.75} width={'100%'} mx={'auto'} maxWidth={1200}>
        <Typography variant="h4" color="text.primary">
          Settings
        </Typography>

        <Card sx={{ boxShadow: (theme) => theme.shadows[4], width: 1 }}>
          <CardContent sx={{ width: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, width: 1 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="settings tabs"
                sx={{ width: 1 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabLabels.map((label, index) => (
                  <Tab key={index} label={label} />
                ))}
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {settingTypes.map((type, index) => {
              const setting = settings[type];
              return (
                <TabPanel key={type} value={tabValue} index={index}>
                  <Stack spacing={3} width={1}>
                    <TextField
                      label="Title"
                      variant="filled"
                      fullWidth
                      value={setting?.title || ''}
                      onChange={(e) => handleTitleChange(type, e.target.value)}
                      required
                    />

                    <Box width={1}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Content
                      </Typography>
                      <RichTextEditor
                        value={setting?.content || ''}
                        onChange={(value) => handleContentChange(type, value)}
                        placeholder={`Enter ${tabLabels[index]} content...`}
                        minHeight={500}
                      />
                    </Box>

                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                      <Button
                        variant="contained"
                        onClick={() => handleSave(type)}
                        disabled={saving || !setting?.title?.trim() || !setting?.content?.trim()}
                        startIcon={saving ? <CircularProgress size={20} /> : null}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </Stack>
                  </Stack>
                </TabPanel>
              );
            })}

            <TabPanel value={tabValue} index={maintenanceTabIndex}>
              <Stack spacing={3} width={1}>
                {/* Status hero */}
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: `1px solid ${BORDER}`,
                    bgcolor: PAGE_CREAM,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: BRAND_DARK,
                      px: 3,
                      py: 2.5,
                      display: 'flex',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: alpha(BRAND_GREEN, 0.18),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconifyIcon
                          icon={
                            maintenance.enabled
                              ? 'mdi:wrench-clock'
                              : 'mdi:shield-check-outline'
                          }
                          width={24}
                          height={24}
                          sx={{ color: BRAND_GREEN }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            color: ON_DARK,
                            fontWeight: 700,
                            fontSize: 18,
                            letterSpacing: 0.2,
                          }}
                        >
                          Mobile App Maintenance
                        </Typography>
                        <Typography
                          sx={{
                            color: BRAND_GREEN,
                            fontSize: 11,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            mt: 0.5,
                          }}
                        >
                          System control
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      label={maintenance.enabled ? 'MAINTENANCE ON' : 'LIVE'}
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        bgcolor: maintenance.enabled
                          ? alpha('#F59E0B', 0.2)
                          : alpha(BRAND_GREEN, 0.2),
                        color: maintenance.enabled ? '#FBBF24' : BRAND_GREEN,
                        border: `1px solid ${
                          maintenance.enabled
                            ? alpha('#F59E0B', 0.45)
                            : alpha(BRAND_GREEN, 0.45)
                        }`,
                      }}
                    />
                  </Box>
                  <Box sx={{ height: 4, bgcolor: BRAND_GREEN }} />
                  <Box sx={{ px: 3, py: 2, bgcolor: SURFACE }}>
                    <Typography sx={{ color: BODY, fontSize: 14, lineHeight: 1.7 }}>
                      When enabled, only selected access users can open the mobile app.
                      Everyone else sees a branded maintenance screen with your reason and
                      countdown timer.
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' },
                    gap: 3,
                    alignItems: 'start',
                  }}
                >
                  {/* Controls */}
                  <Stack spacing={2.5}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        border: `1px solid ${BORDER}`,
                        bgcolor: maintenance.enabled ? alpha('#F59E0B', 0.06) : PANEL,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography fontWeight={700} color="text.primary">
                          Put app on maintenance
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          Instantly show the maintenance screen to all non-access users
                        </Typography>
                      </Box>
                      <Switch
                        checked={maintenance.enabled}
                        onChange={(e) =>
                          setMaintenance((prev) => ({
                            ...prev,
                            enabled: e.target.checked,
                          }))
                        }
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: BRAND_GREEN,
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: BRAND_GREEN,
                          },
                        }}
                      />
                    </Box>

                    <TextField
                      label="Reason / description"
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={3}
                      value={maintenance.reason}
                      onChange={(e) =>
                        setMaintenance((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder="We are upgrading servers. The app will be back soon."
                      required={maintenance.enabled}
                      helperText="Shown on the mobile maintenance screen"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: SURFACE,
                          borderRadius: 2,
                        },
                      }}
                    />

                    <TextField
                      label="Ends at (countdown timer)"
                      type="datetime-local"
                      variant="outlined"
                      fullWidth
                      value={toDatetimeLocalValue(maintenance.ends_at)}
                      onChange={(e) =>
                        setMaintenance((prev) => ({
                          ...prev,
                          ends_at: fromDatetimeLocalValue(e.target.value),
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      helperText="Optional. When this time passes, maintenance turns off automatically."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: SURFACE,
                          borderRadius: 2,
                        },
                      }}
                    />

                    <Autocomplete
                      multiple
                      options={allUsers}
                      value={selectedAllowedUsers}
                      getOptionLabel={(option) =>
                        `${option.name || 'User'} (${option.email || 'no email'})`
                      }
                      isOptionEqualToValue={(option, value) =>
                        String(option.id || option._id) ===
                        String(value.id || value._id)
                      }
                      onChange={(_e, value) => {
                        setMaintenance((prev) => ({
                          ...prev,
                          allowed_user_ids: value.map((u) => String(u.id || u._id)),
                        }));
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.email || option.name || option.id}
                            {...getTagProps({ index })}
                            key={String(option.id || option._id)}
                            sx={{
                              bgcolor: alpha(BRAND_GREEN, 0.12),
                              border: `1px solid ${alpha(BRAND_GREEN, 0.35)}`,
                              color: 'text.primary',
                              fontWeight: 600,
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Access users (whitelist)"
                          placeholder="Select users who can still use the app"
                          helperText={`${selectedAllowedUsers.length} user${
                            selectedAllowedUsers.length === 1 ? '' : 's'
                          } can bypass maintenance`}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: SURFACE,
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Stack direction="row" justifyContent="flex-end" spacing={2} pt={0.5}>
                      <Button
                        variant="contained"
                        onClick={handleSaveMaintenance}
                        disabled={savingMaintenance}
                        startIcon={
                          savingMaintenance ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <IconifyIcon icon="mdi:content-save-outline" width={18} height={18} />
                          )
                        }
                        sx={{
                          bgcolor: BRAND_DARK,
                          color: ON_DARK,
                          px: 3,
                          py: 1.25,
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#2a3214',
                          },
                        }}
                      >
                        {savingMaintenance ? 'Saving...' : 'Save maintenance settings'}
                      </Button>
                    </Stack>
                  </Stack>

                  {/* Live preview — email/app style */}
                  <Box
                    sx={{
                      bgcolor: PAGE_CREAM,
                      borderRadius: 3,
                      p: 2.5,
                      border: `1px solid ${BORDER}`,
                      position: { lg: 'sticky' },
                      top: { lg: 24 },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: MUTED,
                        fontWeight: 700,
                        mb: 1.5,
                      }}
                    >
                      Mobile preview
                    </Typography>

                    <Box
                      sx={{
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        bgcolor: SURFACE,
                        boxShadow: '0 12px 40px rgba(26,31,10,0.12)',
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: BRAND_DARK,
                          px: 3,
                          py: 3,
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            bgcolor: alpha(BRAND_GREEN, 0.15),
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                          }}
                        >
                          <IconifyIcon
                            icon="mdi:book-open-page-variant"
                            width={28}
                            height={28}
                            sx={{ color: BRAND_GREEN }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            color: ON_DARK,
                            fontFamily: 'Georgia, serif',
                            fontSize: 18,
                          }}
                        >
                          Learn-n Label
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.75,
                            color: BRAND_GREEN,
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Scheduled maintenance
                        </Typography>
                      </Box>
                      <Box sx={{ height: 4, bgcolor: BRAND_GREEN }} />
                      <Box sx={{ px: 3, py: 3, textAlign: 'center' }}>
                        <Typography
                          sx={{
                            color: BRAND_DARK,
                            fontWeight: 700,
                            fontSize: 20,
                            mb: 1,
                          }}
                        >
                          We&apos;ll be right back
                        </Typography>
                        <Typography
                          sx={{
                            color: BODY,
                            fontSize: 14,
                            lineHeight: 1.7,
                            mb: 2.5,
                          }}
                        >
                          {maintenance.reason.trim() ||
                            'We are performing scheduled maintenance to improve your experience. Thank you for your patience.'}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: PANEL,
                            border: `1px solid ${BORDER}`,
                            borderRadius: 2,
                            px: 2,
                            py: 1.75,
                            mb: 2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 10,
                              letterSpacing: '0.14em',
                              textTransform: 'uppercase',
                              color: MUTED,
                              fontWeight: 700,
                              mb: 0.75,
                            }}
                          >
                            Estimated return
                          </Typography>
                          <Typography
                            sx={{
                              color: 'text.primary',
                              fontWeight: 700,
                              fontSize: 15,
                            }}
                          >
                            {formatPreviewEndsAt(maintenance.ends_at)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            bgcolor: BRAND_GREEN,
                            color: theme.palette.primary.contrastText,
                            borderRadius: 2,
                            py: 1.25,
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          Check status
                        </Box>
                      </Box>
                      <Divider sx={{ borderColor: BORDER }} />
                      <Box sx={{ bgcolor: PANEL, px: 3, py: 2 }}>
                        <Typography sx={{ fontSize: 13, color: BODY, fontWeight: 600 }}>
                          With care,
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 700 }}>
                          The Learn-n Label Team
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        mt: 2,
                        fontSize: 12,
                        color: MUTED,
                        textAlign: 'center',
                        lineHeight: 1.5,
                      }}
                    >
                      Preview updates as you edit. Save to publish to the live app.
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </TabPanel>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Settings;
