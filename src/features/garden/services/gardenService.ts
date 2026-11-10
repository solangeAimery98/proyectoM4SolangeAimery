import {
    doc,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    type Firestore,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/config';
import { GardenProgress } from '../types/GardenProgress';
import { POINTS_PER_WATERING } from './gardenProgression';

const GARDEN_COLLECTION = 'garden';
const REWARDS_COLLECTION = 'gardenRewards';
const PROGRESS_DOCUMENT = 'progress';
const TASKS_COLLECTION = 'tasks';

// Obtiene la referencia al documento de progreso.
const getProgressRef = (
    firestore: Firestore,
    userId: string
) =>
    doc(
        firestore,
        'users',
        userId,
        GARDEN_COLLECTION,
        PROGRESS_DOCUMENT
    );

// Suscripción en tiempo real al progreso del jardín.
export const subscribeToGardenProgress = (
    userId: string,
    onProgress: (progress: GardenProgress) => void,
    onError: (error: Error) => void,
    firestore: Firestore = db
) => {
    return onSnapshot(
        getProgressRef(firestore, userId),
        (snapshot) => {
            if (!snapshot.exists()) {
                onProgress({
                    growthPoints: 0,
                    totalWaterings: 0,
                    lastRewardTaskId: null,
                    updatedAt: null,
                });

                return;
            }

            onProgress(snapshot.data() as GardenProgress);
        },
        onError
    );
};

// Completa una tarea y otorga su recompensa de crecimiento.
export const completeTaskWithReward = async (
    userId: string,
    taskId: string,
    firestore: Firestore = db
): Promise<{ rewarded: boolean }> => {
    const taskRef = doc(
        firestore,
        TASKS_COLLECTION,
        taskId
    );

    const progressRef = getProgressRef(firestore, userId);

    const rewardRef = doc(
        firestore,
        'users',
        userId,
        REWARDS_COLLECTION,
        taskId
    );

    return runTransaction(firestore, async (transaction) => {
        // 1. Leer la tarea.
        const taskSnapshot = await transaction.get(taskRef);

        if (!taskSnapshot.exists()) {
            throw new Error('La tarea no existe.');
        }

        const task = taskSnapshot.data();

        if (task.userId !== userId) {
            throw new Error(
                'No tenés permiso para modificar esta tarea.'
            );
        }

        // Evitar completar nuevamente una tarea ya completada.
        if (task.completed) {
            return { rewarded: false };
        }

        // 2. Comprobar si la tarea ya recibió una recompensa.
        const rewardSnapshot = await transaction.get(rewardRef);

        // 3. Leer el progreso actual del jardín.
        const progressSnapshot = await transaction.get(progressRef);

        const currentProgress = progressSnapshot.exists()
            ? progressSnapshot.data()
            : {
                growthPoints: 0,
                totalWaterings: 0,
                lastRewardTaskId: null,
            };

        // 4. Actualizar el estado de la tarea.
        transaction.update(taskRef, {
            completed: true,
            completedAt: serverTimestamp(),
        });

        // Si ya recibió una recompensa anteriormente,
        // no volvemos a sumar puntos.
        if (rewardSnapshot.exists()) {
            return { rewarded: false };
        }

        // 5. Registrar la recompensa.
        transaction.set(rewardRef, {
            taskId,
            points: POINTS_PER_WATERING,
            createdAt: serverTimestamp(),
        });

        // 6. Actualizar el progreso del jardín.
        transaction.set(progressRef, {
            growthPoints:
                currentProgress.growthPoints + POINTS_PER_WATERING,

            totalWaterings:
                currentProgress.totalWaterings + 1,

            lastRewardTaskId: taskId,

            updatedAt: serverTimestamp(),
        });

        return { rewarded: true };
    });
};
