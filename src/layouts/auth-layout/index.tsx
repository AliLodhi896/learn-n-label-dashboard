import { PropsWithChildren, ReactElement } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useColorMode } from 'providers/ColorModeProvider';

const AuthLayout = ({ children }: PropsWithChildren): ReactElement => {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(ellipse 70% 50% at 50% -20%, rgba(176,189,49,0.16), transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(39,208,149,0.06), transparent 50%)'
            : 'radial-gradient(ellipse 70% 50% at 50% -20%, rgba(176,189,49,0.18), transparent 60%)',
        position: 'relative',
      }}
    >
      <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        <IconButton
          onClick={toggleColorMode}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 2,
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            color: 'primary.main',
          }}
        >
          <IconifyIcon
            icon={mode === 'dark' ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'}
            width={22}
            height={22}
          />
        </IconButton>
      </Tooltip>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        py={10}
        px={2}
      >
        {children}
      </Stack>
    </Box>
  );
};

export default AuthLayout;
