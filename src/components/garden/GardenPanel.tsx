import React, { useEffect, useRef, useState } from 'react';

import type {
    GardenLevel,
    GardenStage,
} from '../../features/garden/types/GardenProgress';

import '../../styles/garden.css';

interface GardenPanelProps {
    level: GardenLevel;
    stage: GardenStage;
    growthPoints: number;
    totalWaterings: number;
    levelProgress: {
        current: number;
        percentage: number;
        pointsToNextLevel: number;
        isMaxLevel: boolean;
    };
    loading?: boolean;
    error?: string | null;
}

const STAGE_LABELS: Record<GardenStage, string> = {
    sprout: 'Primer brote',
    'first-leaves': 'Primeras hojas',
    growth: 'En crecimiento',
    flowering: 'En floración',
    'full-bloom': 'Plena floración',
};

const GardenPlant: React.FC<{ level: GardenLevel }> = ({
    level,
}) => {
    const showFirstLeaves = level >= 2;
    const showGrowth = level >= 3;
    const showFlowers = level >= 4;
    const showFullBloom = level >= 5;

    return (
        <svg
            className={`garden-plant garden-plant-level-${level}`}
            viewBox="0 0 220 250"
            role="img"
            aria-label={`Ilustración de una planta en nivel ${level}`}
        >
            <ellipse
                cx="110"
                cy="226"
                rx="66"
                ry="9"
                fill="#D9C8C3"
                opacity="0.35"
            />

            <path
                d="M110 180 C108 145 111 105 110 55"
                fill="none"
                stroke="#789B73"
                strokeWidth="5"
                strokeLinecap="round"
            />

            {showFirstLeaves && (
                <>
                    <path
                        d="M109 150 C75 147 68 122 72 108 C97 108 113 126 109 150Z"
                        fill="#A8C69C"
                    />

                    <path
                        d="M109 150 C91 132 83 119 73 109"
                        fill="none"
                        stroke="#789B73"
                        strokeWidth="1.5"
                    />

                    <path
                        d="M111 125 C140 122 151 101 147 87 C125 88 108 104 111 125Z"
                        fill="#B9D3A8"
                    />

                    <path
                        d="M111 125 C128 108 138 96 147 88"
                        fill="none"
                        stroke="#789B73"
                        strokeWidth="1.5"
                    />
                </>
            )}

            {showGrowth && (
                <>
                    <path
                        d="M109 100 C76 97 65 73 70 58 C96 59 115 78 109 100Z"
                        fill="#B9D3A8"
                    />

                    <path
                        d="M109 100 C91 82 80 68 71 59"
                        fill="none"
                        stroke="#789B73"
                        strokeWidth="1.5"
                    />

                    <path
                        d="M111 83 C137 79 153 59 149 45 C126 46 109 63 111 83Z"
                        fill="#A8C69C"
                    />

                    <path
                        d="M111 83 C129 65 139 54 149 46"
                        fill="none"
                        stroke="#789B73"
                        strokeWidth="1.5"
                    />
                </>
            )}

            {showFlowers && (
                <g>
                    <path
                        d="M110 55 C91 43 95 27 108 30 C111 13 128 17 124 34 C141 31 144 47 125 52Z"
                        fill="#EFA0B8"
                    />

                    <circle
                        cx="116"
                        cy="42"
                        r="5"
                        fill="#F6D98D"
                    />
                </g>
            )}

            {showFullBloom && (
                <>
                    <path
                        d="M149 88 C135 79 140 65 151 68 C155 53 169 60 164 73 C179 71 181 85 165 89Z"
                        fill="#F4C2D0"
                    />

                    <circle
                        cx="157"
                        cy="79"
                        r="4"
                        fill="#F6D98D"
                    />

                    <path
                        d="M72 108 C59 100 64 87 75 91 C79 76 92 83 87 96 C102 94 103 108 87 111Z"
                        fill="#EFA0B8"
                    />

                    <circle
                        cx="81"
                        cy="101"
                        r="4"
                        fill="#F6D98D"
                    />
                </>
            )}

            <path
                d="M69 177 H151 L141 218 Q110 231 79 218Z"
                fill="#EFA0B8"
            />

            <path
                d="M77 190 H143 L140 204 H80Z"
                fill="#E58DAA"
                opacity="0.45"
            />

            <rect
                x="64"
                y="171"
                width="92"
                height="13"
                rx="5"
                fill="#E58DAA"
            />

            <path
                d="M101 200 Q110 205 119 200"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
            />
        </svg>
    );
};

export const GardenPanel: React.FC<GardenPanelProps> = ({
    level,
    stage,
    growthPoints,
    totalWaterings,
    levelProgress,
    loading = false,
    error = null,
}) => {
    const [isGrowing, setIsGrowing] = useState(false);
    const [isLevelUp, setIsLevelUp] = useState(false);

    const previousPoints = useRef(growthPoints);
    const previousLevel = useRef(level);
    const hasInitialized = useRef(false);

    const animationTimeout = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    useEffect(() => {
        if (loading) {
            hasInitialized.current = false;
            previousPoints.current = growthPoints;
            previousLevel.current = level;

            return;
        }

        // La primera carga establece el punto de referencia.
        // No debe interpretarse como una recompensa nueva.
        if (!hasInitialized.current) {
            previousPoints.current = growthPoints;
            previousLevel.current = level;
            hasInitialized.current = true;

            return;
        }

        const receivedReward =
            growthPoints > previousPoints.current;

        if (receivedReward) {
            const reachedNewLevel =
                level > previousLevel.current;

            setIsGrowing(true);
            setIsLevelUp(reachedNewLevel);

            if (animationTimeout.current) {
                clearTimeout(animationTimeout.current);
            }

            animationTimeout.current = setTimeout(() => {
                setIsGrowing(false);
                setIsLevelUp(false);
                animationTimeout.current = null;
            }, 1000);
        }

        previousPoints.current = growthPoints;
        previousLevel.current = level;
    }, [growthPoints, level, loading]);

    useEffect(() => {
        return () => {
            if (animationTimeout.current) {
                clearTimeout(animationTimeout.current);
            }
        };
    }, []);

    return (
        <aside
            className="garden-panel"
            aria-label="Tu jardín Bloomy"
        >
            <header className="garden-panel-header">
                <div>
                    <span className="garden-eyebrow">
                        TU ESPACIO BOTÁNICO
                    </span>

                    <h2>Mi jardín</h2>
                </div>

                <span
                    className={`garden-level-badge ${isLevelUp ? 'is-level-up' : ''
                        }`}
                >
                    Nivel {level}
                </span>
            </header>

            {loading ? (
                <p className="garden-loading" role="status">
                    Cargando tu jardín...
                </p>
            ) : error ? (
                <p className="garden-error" role="alert">
                    {error}
                </p>
            ) : (
                <>
                    <div
                        className={`garden-plant-container ${isGrowing ? 'is-growing' : ''
                            }`}
                    >
                        <div className="garden-plant-background" />

                        <GardenPlant level={level} />
                    </div>

                    <div className="garden-stage-info">
                        <h3>{STAGE_LABELS[stage]}</h3>

                        <p>
                            Cada tarea completada ayuda a tu planta a crecer.
                        </p>
                    </div>

                    <section className="garden-progress-section">
                        <div className="garden-progress-header">
                            <span>Progreso de crecimiento</span>

                            <strong>{levelProgress.percentage}%</strong>
                        </div>

                        <div
                            className="garden-progress-track"
                            role="progressbar"
                            aria-label="Progreso hacia el siguiente nivel"
                            aria-valuenow={levelProgress.percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className="garden-progress-fill"
                                style={{
                                    width: `${levelProgress.percentage}%`,
                                }}
                            />
                        </div>

                        <p className="garden-progress-caption">
                            {levelProgress.isMaxLevel
                                ? '¡Tu planta alcanzó su máximo esplendor!'
                                : `Te faltan ${levelProgress.pointsToNextLevel} puntos para el siguiente nivel.`}
                        </p>
                    </section>

                    <div className="garden-stats">
                        <article className="garden-stat">
                            <span className="garden-stat-icon" aria-hidden="true">
                                ✿
                            </span>

                            <strong>{growthPoints}</strong>

                            <span>Puntos</span>
                        </article>

                        <article className="garden-stat">
                            <span className="garden-stat-icon" aria-hidden="true">
                                ♡
                            </span>

                            <strong>{totalWaterings}</strong>

                            <span>Riegos</span>
                        </article>
                    </div>
                </>
            )}
        </aside>
    );
};