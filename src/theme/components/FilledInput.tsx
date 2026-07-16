import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import pxToRem from 'theme/functions/px-to-rem';

const FilledInput: Components<Omit<Theme, 'components'>>['MuiFilledInput'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 14,
      borderWidth: pxToRem(1),
      borderStyle: 'solid',
      borderColor: theme.palette.divider,
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : theme.palette.action.focus,
      '&:hover': {
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.06)'
            : theme.palette.action.focus,
      },
      '&.Mui-focused': {
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(176, 189, 49, 0.08)'
            : theme.palette.action.focus,
        borderColor: theme.palette.primary.main,
      },
      '&::before': {
        border: 'none',
      },
      '&::after': {
        border: 'none',
      },
      '&:hover:not(.Mui-disabled,.Mui-error):before': {
        border: 'none',
      },
    }),
    focused: ({ theme }) => ({
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(176, 189, 49, 0.08)'
          : theme.palette.action.focus,
    }),
    input: ({ theme }) => ({
      paddingLeft: pxToRem(18),
      paddingTop: pxToRem(12),
      paddingBottom: pxToRem(12),
      color: theme.palette.text.primary,
      '&::placeholder': {
        opacity: 1,
        color: theme.palette.text.secondary,
      },
      '&:-webkit-autofill': {
        borderTopLeftRadius: 'inherit',
        borderBottomLeftRadius: 'inherit',
        borderTopRightRadius: 'initial',
        borderBottomRightRadius: 'initial',
      },
    }),
    error: ({ theme }) => ({
      borderColor: theme.palette.error.main,
    }),
    adornedEnd: ({ theme }) => ({
      color: theme.palette.text.secondary,
    }),
    inputAdornedEnd: ({ theme }) => ({
      color: theme.palette.text.primary,
    }),
    multiline: () => ({
      alignItems: 'start',
      minHeight: pxToRem(90),
      paddingTop: 0,
      paddingBottom: pxToRem(0),
      paddingLeft: 0,
      borderRadius: pxToRem(16),
    }),
  },
};

export default FilledInput;
