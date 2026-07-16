import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Card: Components<Omit<Theme, 'components'>>['MuiCard'] = {
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      height: 'min-content',
      padding: theme.spacing(2.5),
      borderRadius: theme.shape.borderRadius * 2.2,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing(2.5),
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[4],
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        borderColor:
          theme.palette.mode === 'dark'
            ? 'rgba(176, 189, 49, 0.28)'
            : theme.palette.divider,
      },
    }),
  },
};

export default Card;
