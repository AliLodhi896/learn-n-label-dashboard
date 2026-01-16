import { ReactElement, Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import loginBanner from 'assets/authentication-banners/login.png';
import IconifyIcon from 'components/base/IconifyIcon';
import logo from 'assets/logo/logo.svg';
import Image from 'components/base/Image';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';

const Login = (): ReactElement => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login page - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);
    if (!authLoading && isAuthenticated) {
      console.log('Redirecting to home from login page');
      navigate(paths.home, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      console.log('Login successful, checking authentication state...');
      // The useEffect will handle navigation when isAuthenticated becomes true
      // But we can also navigate directly if needed
      const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        console.log('Token exists:', !!token, 'User exists:', !!user);
        if (token && user) {
          navigate(paths.home, { replace: true });
        }
      };
      // Check immediately and after a short delay
      checkAuth();
      setTimeout(checkAuth, 200);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Login failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Stack
      direction="row"
      bgcolor="background.paper"
      boxShadow={(theme) => theme.shadows[3]}
      height={560}
      width={{ md: 960 }}
    >
      <Stack width={{ md: 0.5 }} m={2.5} gap={4}>
        <Link href="/" mx="auto" >
          <Image src={logo} width={120} height={120} />
        </Link>
        <Stack
          component="form"
          onSubmit={handleSubmit}
          alignItems="center"
          gap={2.5}
          width={330}
          mx="auto"
        >
          <Typography variant="h3">Login</Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          <FormControl variant="standard" fullWidth>
            <InputLabel shrink htmlFor="email">
              Email
            </InputLabel>
            <TextField
              variant="filled"
              placeholder="Enter your email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconifyIcon icon="ic:baseline-email" />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl variant="standard" fullWidth>
            <InputLabel shrink htmlFor="password">
              Password
            </InputLabel>
            <TextField
              variant="filled"
              placeholder="********"
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={isLoading}
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {showPassword ? (
                        <IconifyIcon icon="ic:baseline-key-off" />
                      ) : (
                        <IconifyIcon icon="ic:baseline-key" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'flex-end',
            }}
          >
            <Link href="/authentication/forgot-password" underline="hover">
              Forget password
            </Link>
          </Typography>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
          
        </Stack>
      </Stack>
      <Suspense
        fallback={
          <Skeleton variant="rectangular" height={1} width={1} sx={{ bgcolor: 'primary.main' }} />
        }
      >
        <Image
          alt="Login banner"
          src={loginBanner}
          sx={{
            width: 0.5,
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Suspense>
    </Stack>
  );
};

export default Login;
