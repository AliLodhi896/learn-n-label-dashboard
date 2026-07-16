import { MouseEventHandler, ReactElement } from 'react';
import {
  AppBar,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { drawerWidth } from 'layouts/main-layout';

import { useLocation } from 'react-router-dom';
import capitalizePathname from 'helpers/capitalize-pathname';
import AccountDropdown from './AccountDropdown';
import Image from 'components/base/Image';
import logo from 'assets/logo/logo.svg';
import { useColorMode } from 'providers/ColorModeProvider';

interface TopbarProps {
  handleDrawerToggle: MouseEventHandler;
}

const Topbar = ({ handleDrawerToggle }: TopbarProps): ReactElement => {
  const { pathname } = useLocation();
  const title = capitalizePathname(pathname);
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar
      sx={{
        width: { lg: `calc(100% - ${drawerWidth}px + 24px)` },
        ml: { lg: `${drawerWidth}px` },
      }}
    >
      <Toolbar
        sx={{
          p: 3.75,
        }}
      >
        <Stack direction="row" gap={1}>
          <Link href="/" width={20} height={20} display={{ xs: 'block', lg: 'none' }}>
            <IconButton color="inherit" sx={{ p: 0.75, bgcolor: 'inherit' }}>
              <Image src={logo} width={1} height={1} />
            </IconButton>
          </Link>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              width: 40,
              height: 40,
              m: 0,
              p: 0.75,
              display: { lg: 'none' },
              bgcolor: 'action.hover',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconifyIcon icon="mdi:menu" />
          </IconButton>
          <IconButton
            color="inherit"
            sx={{
              width: 40,
              height: 40,
              p: 1,
              display: { xs: 'flex', lg: 'none' },
              mr: 'auto',
              bgcolor: 'action.hover',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconifyIcon icon="mdi:search" width={1} height={1} />
          </IconButton>
        </Stack>
        <Stack
          display={{ xs: 'none', lg: 'flex' }}
          direction="row"
          gap={{ lg: 6.25 }}
          alignItems="center"
          flex={'1 1 auto'}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                color: 'primary.main',
                letterSpacing: '0.14em',
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              Learn-n Label
            </Typography>
            <Typography variant="h5" component="h5" fontWeight={700}>
              {pathname === '/' ? 'Dashboard' : title}
            </Typography>
          </Box>
          <TextField
            variant="outlined"
            placeholder="Search..."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ width: 24, height: 24 }}>
                  <IconifyIcon icon="mdi:search" width={1} height={1} />
                </InputAdornment>
              ),
            }}
            fullWidth
            sx={{ maxWidth: 330 }}
          />
        </Stack>
        <Stack direction="row" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleColorMode}
              aria-label="toggle color mode"
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <IconifyIcon
                icon={mode === 'dark' ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'}
                width={22}
                height={22}
              />
            </IconButton>
          </Tooltip>
          <AccountDropdown />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

/** Local helper — avoid extra import for a tiny wrapper */
function Box({ children }: { children: React.ReactNode }) {
  return <Stack component="div">{children}</Stack>;
}

export default Topbar;
