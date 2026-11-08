import React from 'react';

interface TaskSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export const TaskSearch: React.FC<TaskSearchProps> = ({
    value,
    onChange,
}) => {
    return (
        <div className="dashboard-search">
            <svg
                className="dashboard-search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>

            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Buscar una tarea..."
                aria-label="Buscar tareas"
            />
        </div>
    );
};