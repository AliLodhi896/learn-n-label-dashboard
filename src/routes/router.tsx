import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter } from 'react-router-dom';

import paths, { rootPaths } from './paths';

import PageLoader from '../components/loading/PageLoader';
import Splash from 'components/loading/Splash';
import ProtectedRoute from 'components/auth/ProtectedRoute';

const App = lazy(() => import('App'));
const MainLayout = lazy(async () => {
  return Promise.all([
    import('layouts/main-layout'),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([moduleExports]) => moduleExports);
});
const AuthLayout = lazy(async () => {
  return Promise.all([
    import('layouts/auth-layout'),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([moduleExports]) => moduleExports);
});

const Error404 = lazy(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return import('pages/errors/Error404');
});

const Sales = lazy(async () => {
  return Promise.all([
    import('pages/home/Sales'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports);
});

const Users = lazy(async () => import('pages/users/Users'));
const Labels = lazy(async () => import('pages/labels/Labels'));
const Newsletters = lazy(async () => import('pages/newsletters/Newsletters'));
const SubscriptionSales = lazy(async () => import('pages/subscription-sales/SubscriptionSales'));
const Subscribers = lazy(async () => import('pages/subscribers/Subscribers'));
const UserDistributions = lazy(async () => import('pages/user-distributions/UserDistributions'));
const Settings = lazy(async () => import('pages/settings/Settings'));

const Login = lazy(async () => import('pages/authentication/Login'));
const SignUp = lazy(async () => import('pages/authentication/SignUp'));

const ResetPassword = lazy(async () => import('pages/authentication/ResetPassword'));
const ForgotPassword = lazy(async () => import('pages/authentication/ForgotPassword'));

const routes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<Splash />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: rootPaths.homeRoot,
        element: (
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        ),
        children: [
          {
            path: paths.home,
            element: <Sales />,
          },
          {
            path: paths.users,
            element: <Users />,
          },
          {
            path: paths.labels,
            element: <Labels />,
          },
          {
            path: paths.newsletters,
            element: <Newsletters />,
          },
          {
            path: paths.subscriptionSales,
            element: <SubscriptionSales />,
          },
          {
            path: paths.subscribers,
            element: <Subscribers />,
          },
          {
            path: paths.userDistributions,
            element: <UserDistributions />,
          },
          {
            path: paths.settings,
            element: <Settings />,
          },
        ],
      },
      {
        path: rootPaths.authRoot,
        element: (
          <AuthLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </AuthLayout>
        ),
        children: [
          {
            path: paths.login,
            element: <Login />,
          },
          {
            path: paths.signup,
            element: <SignUp />,
          },
          {
            path: paths.resetPassword,
            element: <ResetPassword />,
          },
          {
            path: paths.forgotPassword,
            element: <ForgotPassword />,
          },
        ],
      },
      {
        path: '*',
        element: <Error404 />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
