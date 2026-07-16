import { PaletteOptions } from '@mui/material';
import {
  brand,
  caribbeanGreen,
  downy,
  watermelon,
  orange,
  darkSurface,
  lightSurface,
  smoke,
} from './colors';

export type ColorMode = 'light' | 'dark';

export const getPalette = (mode: ColorMode): PaletteOptions => {
  const isDark = mode === 'dark';

  return {
    mode,
    primary: {
      main: brand[500],
      light: brand[300],
      dark: brand[600],
      contrastText: isDark ? '#0F120C' : '#FFFFFF',
    },
    secondary: {
      main: caribbeanGreen[500],
      light: caribbeanGreen[300],
      dark: caribbeanGreen[700],
      contrastText: '#FFFFFF',
    },
    info: {
      main: downy[500],
    },
    success: {
      main: brand[500],
    },
    error: {
      main: watermelon[500],
    },
    warning: {
      main: orange[500],
    },
    common: {
      black: '#0A0C08',
      white: '#FFFFFF',
    },
    text: isDark
      ? {
          primary: '#F2F4EA',
          secondary: '#9BA391',
          disabled: '#5C6354',
        }
      : {
          primary: lightSurface.ink,
          secondary: lightSurface.muted,
          disabled: smoke[300],
        },
    action: isDark
      ? {
          active: brand[400],
          hover: 'rgba(176, 189, 49, 0.08)',
          selected: 'rgba(176, 189, 49, 0.14)',
          disabled: '#5C6354',
          disabledBackground: 'rgba(255,255,255,0.06)',
          focus: 'rgba(176, 189, 49, 0.12)',
        }
      : {
          active: brand[600],
          hover: 'rgba(176, 189, 49, 0.08)',
          selected: 'rgba(176, 189, 49, 0.12)',
          disabled: smoke[400],
          disabledBackground: smoke[100],
          focus: 'rgba(176, 189, 49, 0.1)',
        },
    background: isDark
      ? {
          default: darkSurface.default,
          paper: darkSurface.paper,
        }
      : {
          default: lightSurface.default,
          paper: lightSurface.paper,
        },
    divider: isDark ? darkSurface.border : lightSurface.border,
  };
};

export default getPalette('dark');
