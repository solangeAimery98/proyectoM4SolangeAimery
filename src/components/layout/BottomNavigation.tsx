import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authService';
import {
  TasksIcon,
  SummaryIcon,
  LogoutIcon,
} from './icons';
import '../../styles/layout.css';

export interface NavItem {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

export interface BottomNavigationProps {
  items?: NavItem[];
  className?: string;
}

const DEFAULT_BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Tareas',
    icon: <TasksIcon size={22} />,
  },
  {
    to: '/summary',
    label: 'Resumen',
    icon: <SummaryIcon size={22} />,
  },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items = DEFAULT_BOTTOM_NAV_ITEMS,
  className = '',
}) => {
  const navigate = useNavigate();

  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLogoutError('');
    setLoggingOut(true);

    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setLogoutError(
        'No se pudo cerrar la sesión. Intentá nuevamente.'
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav
      className={`bloomy-bottom-nav ${className}`.trim()}
      aria-label="Navegación inferior móvil"
    >
      <div className="bloomy-bottom-nav-container">

        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `bloomy-bottom-nav-item ${isActive ? 'active' : ''}`
            }
          >
            {item.icon && (
              <span className="bloomy-bottom-nav-icon">
                {item.icon}
              </span>
            )}

            <span className="bloomy-bottom-nav-label">
              {item.label}
            </span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="bloomy-bottom-nav-item"
          aria-label="Cerrar sesión"
        >
          <span className="bloomy-bottom-nav-icon">
            <LogoutIcon size={22} />
          </span>

          <span className="bloomy-bottom-nav-label">
            {loggingOut ? 'Saliendo...' : 'Salir'}
          </span>
        </button>

      </div>

      {logoutError && (
        <p className="bloomy-logout-error" role="alert">
          {logoutError}
        </p>
      )}
    </nav>
  );
};

export default BottomNavigation;