import { ReactElement } from 'react';
import {
  Box,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import IconifyIcon from 'components/base/IconifyIcon';
import logo from 'assets/logo/logo.svg';
import Image from 'components/base/Image';
import navItems from 'data/nav-items';
import NavButton from './NavButton';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';

const Sidebar = (): ReactElement => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(paths.login, { replace: true });
  };

  return (
    <Stack
      height={1}
      sx={{
        overflow: 'hidden',
        margin: { xs: 0, lg: 2.5 },
        borderRadius: { xs: 0, lg: 3 },
        width: { xs: 260, lg: 230 },
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => theme.shadows[4],
        '&:hover': {
          overflowY: 'auto',
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 3.5,
          pb: 2,
          textAlign: 'center',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Link
          href="/"
          sx={{
            display: 'inline-flex',
            width: 88,
            height: 88,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(176,189,49,0.08)'
                : 'rgba(176,189,49,0.1)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            p: 1,
          }}
        >
          <Image src={logo} width={1} />
        </Link>
        <Typography
          sx={{
            mt: 1.5,
            fontWeight: 700,
            fontSize: 15,
            color: 'text.primary',
            letterSpacing: 0.2,
          }}
        >
          Learn-n Label
        </Typography>
        <Typography
          sx={{
            mt: 0.35,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'primary.main',
            fontWeight: 600,
          }}
        >
          Admin console
        </Typography>
      </Box>

      <Stack
        justifyContent="space-between"
        height={1}
        sx={{
          overflow: 'hidden',
          '&:hover': {
            overflowY: 'auto',
          },
          pt: 1.5,
        }}
      >
        <List
          sx={{
            mx: 1.5,
            py: 1,
            flex: '1 1 auto',
          }}
        >
          {navItems.map((navItem, index) => (
            <NavButton key={index} navItem={navItem} Link={Link} />
          ))}
        </List>
        <List sx={{ mx: 1.5, mb: 2 }}>
          <ListItem sx={{ mx: 0, my: 0.5, p: 0 }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: 'text.secondary',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: 'error.main',
                  color: 'common.white',
                  borderColor: 'error.main',
                  '& .MuiListItemIcon-root': {
                    color: 'common.white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <IconifyIcon icon="ri:logout-circle-line" />
              </ListItemIcon>
              <ListItemText primary="Log out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Stack>
    </Stack>
  );
};

export default Sidebar;
