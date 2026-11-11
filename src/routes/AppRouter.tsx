import React from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Tasks } from '../pages/Tasks';
import Summary from '../pages/Summary';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Rutas privadas */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Tasks />} />
          <Route path="/summary" element={<Summary />} />
        </Route>

        {/* Ruta no encontrada */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
};