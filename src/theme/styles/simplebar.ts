import { Theme } from '@mui/material';

const simplebar = (theme: Theme) => ({
  '& .simplebar-track': {
    '&.simplebar-vertical': {
      '& .simplebar-scrollbar': {
        '&:before': {
          cursor: 'grab',
          border: 1,
          borderStyle: 'solid',
          borderColor: theme.palette.divider,
          maxHeight: '100vh',
          background: theme.palette.mode === 'dark'
            ? 'rgba(176, 189, 49, 0.35)'
            : theme.palette.grey[400],
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
          },
        },

        '&.simplebar-visible': {
          '&:before': {
            opacity: 1,
            padding: 0,
          },
        },
      },
    },
  },
  '& .simplebar-wrapper': {
    '& .simplebar-content': {
      overflow: 'hidden',
    },
  },
});
export default simplebar;
