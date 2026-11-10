import React from 'react';
import { NavLink } from 'react-router-dom';
import { TasksIcon, SummaryIcon } from './icons';
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
    to: '/test-summary',
    label: 'Resumen',
    icon: <SummaryIcon size={22} />,
  },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items = DEFAULT_BOTTOM_NAV_ITEMS,
  className = '',
}) => {
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
      </div>
    </nav>
  );
};

export default BottomNavigation;