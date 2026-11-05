import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { logoutUser } from '../features/auth/authService';

export const Navbar: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setError('');

    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('No se pudo cerrar la sesión. Intentá nuevamente.');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Task Manager</Link>
      </div>

      <div className="navbar-menu">
        {loading ? (
          <span>Cargando...</span>
        ) : currentUser ? (
          <>
            <span className="navbar-user">{currentUser.email}</span>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>

      {error && <p role="alert">{error}</p>}
    </nav>
  );
};