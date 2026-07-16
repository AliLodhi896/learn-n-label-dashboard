import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import pxToRem from 'theme/functions/px-to-rem';

const OutlinedInput: Components<Omit<Theme, 'components'>>['MuiOutlinedInput'] = {
  defaultProps: {
    autoComplete: 'off',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 14,
      borderWidth: pxToRem(1),
      borderStyle: 'solid',
      borderColor: theme.palette.divider,
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.03)'
          : theme.palette.background.paper,
      transition: 'border-color 0.2s ease, background-color 0.2s ease',
      '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${theme.palette.primary.main}`,
      },
      '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline > legend': {
        width: 0,
      },
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
    }),
    notchedOutline: ({ theme }) => ({
      borderColor: theme.palette.divider,
    }),
    adornedEnd: ({ theme }) => ({
      color: theme.palette.text.secondary,
    }),
    inputAdornedEnd: ({ theme }) => ({
      color: theme.palette.text.primary,
    }),
  },
};

export default OutlinedInput;
