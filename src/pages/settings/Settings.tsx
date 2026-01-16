import { ReactElement, useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { drawerWidth } from 'layouts/main-layout';
import RichTextEditor from 'components/sections/Settings/ClassicEditor';
import { settingsService, Setting, SettingType } from 'services/settings';

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

const Settings = (): ReactElement => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<Record<SettingType, Setting | null>>({
    privacy_policy: null,
    terms_and_conditions: null,
    about_us: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const settingTypes: SettingType[] = ['privacy_policy', 'terms_and_conditions', 'about_us'];
  const tabLabels = ['Privacy Policy', 'Terms and Conditions', 'About Us'];

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const allSettings = await settingsService.getAllSettings();
      
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
        // Update existing setting
        await settingsService.updateSetting(type, {
          title: setting.title,
          content: setting.content,
        });
        setSuccess(`${tabLabels[settingTypes.indexOf(type)]} updated successfully`);
      } else {
        // Create new setting
        await settingsService.createSetting({
          type,
          title: setting.title,
          content: setting.content,
        });
        setSuccess(`${tabLabels[settingTypes.indexOf(type)]} created successfully`);
      }

      // Refresh settings after save
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
      <Stack spacing={3.75} width={'100%'} mx={'auto'} maxWidth={1200} >
        <Typography variant="h4" color="text.primary">
          Settings
        </Typography>

        <Card sx={{ boxShadow: (theme) => theme.shadows[4], width: 1 }}>
          <CardContent sx={{ width: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, width: 1 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs" sx={{ width: 1 }}>
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
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Settings;
