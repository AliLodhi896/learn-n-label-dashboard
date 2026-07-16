import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import BreakpointsProvider from 'providers/BreakpointsProvider.tsx';
import { AuthProvider } from 'providers/AuthProvider.tsx';
import { ColorModeProvider } from 'providers/ColorModeProvider.tsx';
import router from 'routes/router.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <BreakpointsProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </BreakpointsProvider>
    </ColorModeProvider>
  </React.StrictMode>,
);
