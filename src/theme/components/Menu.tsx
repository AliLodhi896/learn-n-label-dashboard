import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Menu: Components<Omit<Theme, 'components'>>['MuiMenu'] = {
  defaultProps: {},
  styleOverrides: {
    paper: ({ theme }) => ({
      minWidth: theme.spacing(22.625),
      borderRadius: theme.shape.borderRadius * 1.8,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[4],
      backgroundImage: 'none',
      backgroundColor: theme.palette.background.paper,
    }),
  },
};

export default Menu;
