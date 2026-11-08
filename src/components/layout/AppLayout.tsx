import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarProps } from './Sidebar';
import { BottomNavigation, BottomNavigationProps } from './BottomNavigation';
import '../../styles/layout.css';

export interface AppLayoutProps {
  children?: React.ReactNode;
  sidebarProps?: SidebarProps;
  bottomNavProps?: BottomNavigationProps;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  sidebarProps,
  bottomNavProps,
  className = '',
}) => {
  return (
    <div className={`bloomy-app-layout ${className}`.trim()}>
      <Sidebar {...sidebarProps} />
      <div className="bloomy-layout-content-wrapper">
        <main className="bloomy-main-content">
          {children ?? <Outlet />}
        </main>
      </div>
      <BottomNavigation {...bottomNavProps} />
    </div>
  );
};

export default AppLayout;

