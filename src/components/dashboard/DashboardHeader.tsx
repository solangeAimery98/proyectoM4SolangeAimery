import React from 'react';
import { TaskSearch } from './TaskSearch';
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
}) => {
    return (
        <header className="dashboard-header">
            <div className="dashboard-header-welcome">
                <span className="dashboard-eyebrow">
                    TU ESPACIO PERSONAL
                </span>

                <h1>¡Hola, {userName}!</h1>

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
};