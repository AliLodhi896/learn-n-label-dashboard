import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import scrollbar from 'theme/styles/scrollbar';
import echart from 'theme/styles/echart';
import 'simplebar-react/dist/simplebar.min.css';
import simplebar from 'theme/styles/simplebar';

const CssBaseline: Components<Omit<Theme, 'components'>>['MuiCssBaseline'] = {
  defaultProps: {},
  styleOverrides: (theme) => ({
    html: {
      scrollBehavior: 'smooth',
    },
    body: {
      ...scrollbar(theme),
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      selection: undefined,
    },
    '::selection': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(176, 189, 49, 0.35)'
          : 'rgba(176, 189, 49, 0.28)',
      color: theme.palette.text.primary,
    },
    ...echart(),
    ...simplebar(theme),
  }),
};

export default CssBaseline;
