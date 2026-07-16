import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const AppBar: Components<Omit<Theme, 'components'>>['MuiAppBar'] = {
  defaultProps: {
    color: 'transparent',
    elevation: 0,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(15, 18, 12, 0.78)'
          : 'rgba(238, 241, 228, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      color: theme.palette.text.primary,
    }),
  },
};

export default AppBar;
