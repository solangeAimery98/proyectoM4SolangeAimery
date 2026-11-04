import React from 'react';
import { AuthProvider } from './features/auth/AuthContext';
import { AppRouter } from './routes/AppRouter';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;

