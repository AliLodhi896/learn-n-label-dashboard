import { Link, Stack, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Stack
      direction="row"
      justifyContent={{ xs: 'center', md: 'flex-end' }}
      ml={{ xs: 3.75, lg: 34.75 }}
      mr={3.75}
      my={3.75}
      sx={{
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        pt: 2.5,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="subtitle2" fontFamily={'Poppins'} color="text.secondary">
        Crafted with{' '}
        <Typography component="span" color="primary.main" fontWeight={700}>
          &#10084;
        </Typography>{' '}
        by{' '}
        <Link
          href="https://bmybrand.com/"
          target="_blank"
          rel="noopener"
          sx={{ color: 'text.primary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
        >
          Bmybrand @2026
        </Link>
      </Typography>
    </Stack>
  );
};

export default Footer;
