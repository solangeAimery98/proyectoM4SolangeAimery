import { useMemo, useState } from 'react';

import { useAuth } from '../features/auth/AuthContext';
import { useTasks } from '../features/tasks/useTasks';
import { useGardenProgress } from '../features/garden/hooks/useGardenProgress';

import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { GardenPanel } from '../components/garden/GardenPanel';

import '../styles/dashboard.css';
import '../styles/summary.css';

const WEEK_DAYS = 7;

const Summary = () => {
    const { currentUser } = useAuth();

    const {
        tasks,
        loading: tasksLoading,
        error: tasksError,
    } = useTasks(currentUser?.uid);

    const {
        progress,
        level,
        stage,
        levelProgress,
        loading: gardenLoading,
        error: gardenError,
    } = useGardenProgress(currentUser?.uid);

    // Estado del envío del informe.
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailStatus, setEmailStatus] = useState<
        'idle' | 'success' | 'error'
    >('idle');

    const [emailMessage, setEmailMessage] = useState('');

    // Estadísticas generales.
    const statistics = useMemo(() => {
        const total = tasks.length;

        const completed = tasks.filter(
            (task) => task.completed
        ).length;

        const pending = total - completed;

        const percentage =
            total > 0
                ? Math.round((completed / total) * 100)
                : 0;

        return {
            total,
            completed,
            pending,
            percentage,
        };
    }, [tasks]);

    // Actividad de los últimos siete días.
    const weeklyActivity = useMemo(() => {
        const today = new Date();

        today.setHours(23, 59, 59, 999);

        const firstDay = new Date(today);

        firstDay.setDate(
            firstDay.getDate() - (WEEK_DAYS - 1)
        );

        firstDay.setHours(0, 0, 0, 0);

        return Array.from({ length: WEEK_DAYS }, (_, index) => {
            const date = new Date(firstDay);

            date.setDate(firstDay.getDate() + index);

            const count = tasks.filter((task) => {
                if (!task.completed || !task.completedAt) {
                    return false;
                }

                const completedDate = task.completedAt.toDate();

                const dayEnd = new Date(date);

                dayEnd.setHours(23, 59, 59, 999);

                return (
                    completedDate >= date &&
                    completedDate <= dayEnd
                );
            }).length;

            const isToday =
                date.toDateString() === new Date().toDateString();

            return {
                date,
                count,
                isToday,
                label: date
                    .toLocaleDateString('es-AR', {
                        weekday: 'short',
                    })
                    .replace('.', ''),
            };
        });
    }, [tasks]);

    // Nombre del usuario.
    const userName =
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        'floreciente';

    // ==========================================
    // ENVÍO DEL RESUMEN POR EMAIL
    // ==========================================

    const handleSendSummary = async () => {
        if (!currentUser) {
            setEmailStatus('error');

            setEmailMessage(
                'Necesitás iniciar sesión para enviar tu resumen.'
            );

            return;
        }

        setEmailLoading(true);
        setEmailStatus('idle');
        setEmailMessage('');

        try {
            // 1. Obtener el token de autenticación.
            const token = await currentUser.getIdToken();

            // 2. Solicitar al backend el envío del informe.
            const response = await fetch('/api/send-summary', {
                method: 'POST',

                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // 3. Interpretar la respuesta del servidor.
            const data: {
                success?: boolean;
                message?: string;
            } = await response.json();

            // 4. Comprobar que el envío haya sido exitoso.
            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    'No pudimos enviar tu resumen. Intentá nuevamente.'
                );
            }

            // 5. Actualizar el estado de éxito.
            setEmailStatus('success');

            setEmailMessage(
                `¡Tu resumen fue enviado correctamente a ${currentUser.email}!`
            );

        } catch (error: unknown) {
            console.error(
                'ERROR AL ENVIAR EL RESUMEN:',
                error
            );

            setEmailStatus('error');

            setEmailMessage(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado. Intentá nuevamente.'
            );

        } finally {
            setEmailLoading(false);
        }
    };

    // ==========================================
    // ESTADOS DE CARGA Y ERROR
    // ==========================================

    if (tasksLoading) {
        return (
            <section className="dashboard-container">
                <p role="status">
                    Preparando tu resumen...
                </p>
            </section>
        );
    }

    if (tasksError) {
        return (
            <section className="dashboard-container">
                <p role="alert">
                    No pudimos cargar tus estadísticas.
                    Intentá nuevamente.
                </p>
            </section>
        );
    }

    // ==========================================
    // RENDERIZADO
    // ==========================================

    return (
        <section className="dashboard-container summary-page">

            {/* ENCABEZADO */}

            <header className="dashboard-header">
                <div className="dashboard-header-welcome">

                    <span className="dashboard-eyebrow">
                        TU ESPACIO BLOOMY
                    </span>

                    <h1>Tu progreso, {userName}</h1>

                    <p>
                        Cada pequeño paso cuenta.
                        Mirá todo lo que estás haciendo crecer.
                    </p>

                </div>
            </header>

            {/* ESTADÍSTICAS */}

            <section
                className="summary-section"
                aria-labelledby="summary-statistics-title"
            >
                <div className="summary-section-heading">

                    <h2 id="summary-statistics-title">
                        Tu actividad
                    </h2>

                    <p>
                        Un vistazo a tus tareas y objetivos.
                    </p>

                </div>

                <DashboardSummary
                    total={statistics.total}
                    pending={statistics.pending}
                    completed={statistics.completed}
                    percentage={statistics.percentage}
                />

            </section>

            {/* ACTIVIDAD SEMANAL */}

            <section
                className="summary-section"
                aria-labelledby="weekly-activity-title"
            >
                <div className="summary-section-heading">

                    <h2 id="weekly-activity-title">
                        Tu semana
                    </h2>

                    <p>
                        Tareas que completaste durante
                        los últimos siete días.
                    </p>

                </div>

                <div className="weekly-activity">

                    {weeklyActivity.map((day) => {

                        const markerSize =
                            day.count === 0
                                ? 10
                                : 22 + (
                                    day.count / Math.max(
                                        ...weeklyActivity.map(
                                            (item) => item.count
                                        ),
                                        1
                                    )
                                ) * 18;

                        return (
                            <div
                                className={`weekly-activity-day ${day.isToday ? 'is-today' : ''
                                    }`}
                                key={day.date.toISOString()}
                            >

                                <span className="weekly-activity-count">
                                    {day.count}
                                </span>

                                <span
                                    className="weekly-activity-marker"
                                    style={{
                                        width: `${markerSize}px`,
                                        height: `${markerSize}px`,
                                    }}
                                    aria-label={`${day.count} tareas completadas`}
                                />

                                <span className="weekly-activity-label">
                                    {day.label}
                                </span>

                            </div>
                        );
                    })}

                </div>

            </section>

            {/* JARDÍN */}

            <section
                className="summary-section"
                aria-labelledby="garden-summary-title"
            >
                <div className="summary-section-heading">

                    <h2 id="garden-summary-title">
                        Tu jardín
                    </h2>

                    <p>
                        El reflejo de tu constancia y crecimiento.
                    </p>

                </div>

                {gardenError ? (

                    <p role="alert">
                        No pudimos cargar el progreso de tu jardín.
                    </p>

                ) : (

                    <GardenPanel
                        level={level}
                        stage={stage}
                        growthPoints={progress.growthPoints}
                        totalWaterings={progress.totalWaterings}
                        levelProgress={levelProgress}
                        loading={gardenLoading}
                        error={gardenError}
                    />

                )}

            </section>

            {/* ENVÍO DEL INFORME */}

            <section
                className="summary-section summary-email-section"
                aria-labelledby="summary-email-title"
            >

                <div className="summary-section-heading">

                    <h2 id="summary-email-title">
                        Tu progreso en tu email
                    </h2>

                    <p>
                        Guardá tus avances y revisá todo lo
                        que estás haciendo crecer en Bloomy.
                    </p>

                </div>

                <div className="summary-email-card">

                    <span aria-hidden="true">
                        ✉
                    </span>

                    <p>
                        Recibí un informe personalizado con
                        tus estadísticas, el progreso de tu
                        jardín y tu actividad semanal.
                    </p>

                    <p>
                        <strong>
                            {currentUser?.email}
                        </strong>
                    </p>

                    <button
                        type="button"
                        onClick={handleSendSummary}
                        disabled={emailLoading || !currentUser}
                    >
                        {emailLoading
                            ? 'Enviando...'
                            : 'Enviar mi resumen'
                        }
                    </button>

                    {emailStatus === 'success' && (
                        <p
                            role="status"
                            aria-live="polite"
                        >
                            {emailMessage}
                        </p>
                    )}

                    {emailStatus === 'error' && (
                        <p
                            role="alert"
                            aria-live="assertive"
                        >
                            {emailMessage}
                        </p>
                    )}

                </div>

            </section>

        </section>
    );
};

export default Summary;