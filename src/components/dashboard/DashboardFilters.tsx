import React from 'react';
import { TaskFilter } from '../../features/tasks/types/TaskFilter';

interface DashboardFiltersProps {
    activeFilter: TaskFilter;
    onFilterChange: (filter: TaskFilter) => void;
}

const FILTERS: { label: string; value: TaskFilter }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Completadas', value: 'completed' },
];

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
    activeFilter,
    onFilterChange,
}) => {
    return (
        <nav
            className="dashboard-filters"
            aria-label="Filtrar tareas"
        >
            {FILTERS.map((filter) => (
                <button
                    key={filter.value}
                    type="button"
                    className={`dashboard-filter-button ${activeFilter === filter.value ? 'active' : ''
                        }`}
                    onClick={() => onFilterChange(filter.value)}
                    aria-pressed={activeFilter === filter.value}
                >
                    {filter.label}
                </button>
            ))}
        </nav>
    );
};