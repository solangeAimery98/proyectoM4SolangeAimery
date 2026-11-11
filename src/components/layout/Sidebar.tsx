import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { logoutUser } from '../../features/auth/authService';
import {
  BloomyLogoIcon,
  TasksIcon,
  SummaryIcon,
  LogoutIcon,
  UserAvatarIcon,
} from './icons';
import '../../styles/layout.css';

export interface NavItem {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  items?: NavItem[];
  className?: string;
  footer?: React.ReactNode;
}

const DEFAULT_SIDEBAR_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Tareas',
    icon: <TasksIcon size={20} />,
  },
  {
    to: '/summary',
    label: 'Resumen',
    icon: <SummaryIcon size={20} />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  items = DEFAULT_SIDEBAR_ITEMS,
  className = '',
  footer,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setLogoutError('Error al cerrar sesión');
    }
  };

  const userInitial = currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : 'B';

  return (
    <aside
      className={`bloomy-sidebar ${className}`.trim()}
      aria-label="Navegación principal de escritorio"
    >
      <div className="bloomy-sidebar-brand">
        <Link to="/" className="bloomy-brand-link">
          <div className="bloomy-brand-icon-wrapper">
            <BloomyLogoIcon size={30} />
          </div>
          <div className="bloomy-brand-text">
            <span className="bloomy-brand-name">Bloomy</span>
            <span className="bloomy-brand-tagline">Minimalismo botánico</span>
          </div>
        </Link>
      </div>

      <nav className="bloomy-sidebar-nav">
        <span className="bloomy-nav-section-title">Navegación</span>
        <ul className="bloomy-sidebar-list">
          {items.map((item) => (
            <li key={item.to} className="bloomy-sidebar-list-item">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `bloomy-sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                {item.icon && (
                  <span className="bloomy-sidebar-icon">{item.icon}</span>
                )}
                <span className="bloomy-sidebar-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="bloomy-sidebar-footer">
        {footer ? (
          footer
        ) : currentUser ? (
          <div className="bloomy-user-profile">
            <div className="bloomy-user-info">
              <div
                className="bloomy-user-avatar"
                title={currentUser.email || 'Usuario'}
              >
                {userInitial}
              </div>
              <div className="bloomy-user-details">
                <span
                  className="bloomy-user-email"
                  title={currentUser.email || ''}
                >
                  {currentUser.email}
                </span>
                <span className="bloomy-user-status">En línea</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="bloomy-btn-logout"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogoutIcon size={18} />
              <span className="bloomy-logout-text">Salir</span>
            </button>
            {logoutError && (
              <p className="bloomy-logout-error" role="alert">
                {logoutError}
              </p>
            )}
          </div>
        ) : (
          <div className="bloomy-auth-actions">
            <Link to="/login" className="bloomy-btn-auth-link">
              <UserAvatarIcon size={16} />
              <span>Iniciar sesión</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

