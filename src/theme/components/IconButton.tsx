import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const IconButton: Components<Omit<Theme, 'components'>>['MuiIconButton'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      maxWidth: 40,
      maxHeight: 40,
      padding: theme.spacing(1.5),
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.secondary,
      borderRadius: 10,
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.primary.main,
      },
    }),
    sizeSmall: () => ({
      maxWidth: 20,
      maxHeight: 20,
    }),
  },
};

export default IconButton;
