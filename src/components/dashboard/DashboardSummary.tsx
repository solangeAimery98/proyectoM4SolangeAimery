import React from 'react';

interface DashboardSummaryProps {
    total: number;
    pending: number;
    completed: number;
    percentage: number;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
    total,
    pending,
    completed,
    percentage,
}) => {
    return (
        <section
            className="dashboard-summary"
            aria-label="Resumen de tareas"
        >
            <article className="summary-card summary-total">
                <span className="summary-card-label">
                    Total de tareas
                </span>

                <span className="summary-card-value">
                    {total}
                </span>

                <span className="summary-card-description">
                    Tareas creadas
                </span>
            </article>

            <article className="summary-card summary-pending">
                <span className="summary-card-label">
                    Pendientes
                </span>

                <span className="summary-card-value">
                    {pending}
                </span>

                <span className="summary-card-description">
                    Por completar
                </span>
            </article>

            <article className="summary-card summary-completed">
                <span className="summary-card-label">
                    Completadas
                </span>

                <span className="summary-card-value">
                    {completed}
                </span>

                <span className="summary-card-description">
                    Objetivos alcanzados
                </span>
            </article>

            <div className="summary-progress">
                <div className="summary-progress-header">
                    <span>Tu progreso</span>
                    <strong>{percentage}%</strong>
                </div>

                <div
                    className="summary-progress-track"
                    role="progressbar"
                    aria-label="Porcentaje de tareas completadas"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="summary-progress-fill"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </section>
    );
};