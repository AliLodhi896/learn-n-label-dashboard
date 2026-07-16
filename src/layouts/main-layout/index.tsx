import { PropsWithChildren, ReactElement, useState } from 'react';
import { Box, Drawer, Stack, Toolbar } from '@mui/material';

import Sidebar from 'layouts/main-layout/Sidebar/Sidebar';
import Topbar from 'layouts/main-layout/Topbar/Topbar';
import Footer from './Footer';

export const drawerWidth = 278;

const MainLayout = ({ children }: PropsWithChildren): ReactElement => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <>
      <Stack
        direction="row"
        minHeight="100vh"
        bgcolor="background.default"
        sx={{
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(176,189,49,0.09), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(39,208,149,0.05), transparent 50%)'
              : 'radial-gradient(ellipse 80% 50% at 10% -10%, rgba(176,189,49,0.12), transparent 55%)',
        }}
      >
        <Topbar handleDrawerToggle={handleDrawerToggle} />
        <Box
          component="nav"
          sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', lg: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                border: 0,
                backgroundColor: 'background.default',
                backgroundImage: 'none',
              },
            }}
          >
            <Sidebar />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', lg: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                border: 0,
                backgroundColor: 'transparent',
                backgroundImage: 'none',
              },
            }}
            open
          >
            <Sidebar />
          </Drawer>
        </Box>
        <Toolbar
          sx={{
            pt: 12,
            width: 1,
            pb: 0,
          }}
        >
          {children}
        </Toolbar>
      </Stack>
      <Footer />
    </>
  );
};

export default MainLayout;
