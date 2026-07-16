import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Button: Components<Omit<Theme, 'components'>>['MuiButton'] = {
  defaultProps: {
    size: 'medium',
    disableElevation: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: theme.typography.body1.fontSize,
      fontWeight: 600,
      paddingTop: theme.spacing(1.35),
      paddingBottom: theme.spacing(1.35),
      textTransform: 'none',
      textAlign: 'center',
      letterSpacing: 0.1,
      borderRadius: 12,
    }),
    text: ({ theme }) => ({
      color: theme.palette.primary.main,
      padding: theme.spacing(1.25, 2),
      borderRadius: 10,
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    }),
    outlined: ({ theme }) => ({
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 12,
      color: theme.palette.text.primary,
      '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
      },
    }),
    sizeSmall: ({ theme }) => ({
      padding: theme.spacing(0.75, 2.5),
    }),
    sizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.5, 4),
    }),
    outlinedSizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.5, 4),
    }),
    contained: ({ theme }) => ({
      backgroundColor: theme.palette.primary.main,
      borderRadius: 12,
      boxShadow: 'none',
      color: theme.palette.primary.contrastText,
      fontWeight: 700,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        boxShadow: 'none',
      },
    }),
    containedSizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.5, 4),
    }),
    icon: ({ theme }) => ({
      paddingTop: theme.spacing(0.75),
      paddingBottom: theme.spacing(0.75),
    }),
    fullWidth: ({ theme }) => ({
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
    }),
    disabled: () => ({
      cursor: 'not-allowed',
    }),
    containedSecondary: ({ theme }) => ({
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    }),
    textSecondary: ({ theme }) => ({
      color: theme.palette.secondary.main,
    }),
    containedInfo: ({ theme }) => ({
      backgroundColor: theme.palette.info.main,
    }),
    textInfo: ({ theme }) => ({
      color: theme.palette.info.main,
    }),
    containedError: ({ theme }) => ({
      backgroundColor: theme.palette.error.main,
    }),
    textError: ({ theme }) => ({
      color: theme.palette.error.main,
    }),
  },
};

export default Button;
