import {
    GardenLevel,
    GardenStage,
} from '../types/GardenProgress';

// Puntos otorgados por cada tarea completada por primera vez.
export const POINTS_PER_WATERING = 10;

// Puntos necesarios para alcanzar cada nivel.
export const GARDEN_LEVEL_THRESHOLDS: Record<GardenLevel, number> = {
    1: 0,
    2: 50,
    3: 100,
    4: 200,
    5: 350,
};

// Determina el nivel según los puntos acumulados.
export const getGardenLevel = (
    growthPoints: number
): GardenLevel => {
    if (growthPoints >= 350) return 5;
    if (growthPoints >= 200) return 4;
    if (growthPoints >= 100) return 3;
    if (growthPoints >= 50) return 2;

    return 1;
};

// Determina la etapa visual de la planta.
export const getGardenStage = (
    level: GardenLevel
): GardenStage => {
    const stages: Record<GardenLevel, GardenStage> = {
        1: 'sprout',
        2: 'first-leaves',
        3: 'growth',
        4: 'flowering',
        5: 'full-bloom',
    };

    return stages[level];
};

// Calcula el progreso dentro del nivel actual.
export const getLevelProgress = (growthPoints: number) => {
    const level = getGardenLevel(growthPoints);

    if (level === 5) {
        return {
            current: growthPoints,
            percentage: 100,
            pointsToNextLevel: 0,
            isMaxLevel: true,
        };
    }

    const currentThreshold = GARDEN_LEVEL_THRESHOLDS[level];

    const nextThreshold =
        GARDEN_LEVEL_THRESHOLDS[(level + 1) as GardenLevel];

    const pointsInLevel = growthPoints - currentThreshold;
    const pointsRequired = nextThreshold - currentThreshold;

    return {
        current: growthPoints,
        percentage: Math.round(
            (pointsInLevel / pointsRequired) * 100
        ),
        pointsToNextLevel: nextThreshold - growthPoints,
        isMaxLevel: false,
    };
};