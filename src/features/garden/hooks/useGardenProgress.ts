import { useEffect, useState } from 'react';

import { GardenProgress } from '../types/GardenProgress';

import {
    subscribeToGardenProgress,
} from '../services/gardenService';

import {
    getGardenLevel,
    getGardenStage,
    getLevelProgress,
} from '../services/gardenProgression';

// Estado inicial para un usuario que todavía no tiene progreso.
const INITIAL_PROGRESS: GardenProgress = {
    growthPoints: 0,
    totalWaterings: 0,
    lastRewardTaskId: null,
    updatedAt: null,
};

export const useGardenProgress = (userId?: string) => {
    const [progress, setProgress] = useState<GardenProgress>(
        INITIAL_PROGRESS
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setProgress(INITIAL_PROGRESS);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToGardenProgress(
            userId,
            (updatedProgress) => {
                setProgress(updatedProgress);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setError(
                    err.message || 'No se pudo cargar el progreso del jardín.'
                );
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [userId]);

    // Calculamos los datos derivados a partir de los puntos acumulados.
    const level = getGardenLevel(progress.growthPoints);

    const stage = getGardenStage(level);

    const levelProgress = getLevelProgress(progress.growthPoints);

    return {
        progress,
        level,
        stage,
        levelProgress,
        loading,
        error,
    };
};