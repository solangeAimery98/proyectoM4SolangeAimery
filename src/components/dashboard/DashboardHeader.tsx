import React from 'react';
import { TaskSearch } from './TaskSearch';
import { BloomyLogoIcon } from '../layout/icons';
import '../../styles/dashboard.css';

interface DashboardHeaderProps {
    userName: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    userName,
    searchValue,
    onSearchChange,
}) => (
    <header className="dashboard-header">
        <div className="dashboard-mobile-brand">
            <a
                href="/"
                className="dashboard-mobile-brand-link"
                aria-label="Bloomy - Ir a tareas"
            >
                <span className="dashboard-mobile-brand-icon">
                    <BloomyLogoIcon size={28} />
                </span>

                <span className="dashboard-mobile-brand-name">
                    Bloomy
                </span>
            </a>
        </div>

        <div className="dashboard-header-welcome">
            <span className="dashboard-eyebrow">
                TU ESPACIO PERSONAL
            </span>

            <h1>¡Hola!</h1>

            <span className="dashboard-user-email">
                {userName}
            </span>

            <p>
                Cada pequeño paso cuenta. ¿Qué vamos a hacer hoy?
            </p>
        </div>

        <TaskSearch
            value={searchValue}
            onChange={onSearchChange}
        />
    </header>
);