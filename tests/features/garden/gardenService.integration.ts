import { readFileSync } from 'node:fs';

import {
    beforeAll,
    beforeEach,
    afterAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    initializeTestEnvironment,
    RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from 'firebase/firestore';

// Evitamos inicializar la conexión de producción.
// El servicio recibirá la instancia del emulador por parámetro.
vi.mock('../../../src/services/firebase/config', () => ({
    db: {},
}));

import {
    completeTaskWithReward,
} from '../../../src/features/garden/services/gardenService';

let testEnv: RulesTestEnvironment;

const PROJECT_ID = 'task-manager-garden-test';

const USER_A = 'user-a';
const USER_B = 'user-b';

// Crea tareas de prueba sin pasar por las reglas.
const seedTask = async (
    taskId: string,
    userId: string = USER_A
) => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();

        await setDoc(doc(db, 'tasks', taskId), {
            title: 'Estudiar React',
            description: 'Practicar componentes',
            completed: false,
            userId,
            createdAt: new Date(),
        });
    });
};

beforeAll(async () => {
    const rules = readFileSync('firestore.rules', 'utf8');

    testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
            host: '127.0.0.1',
            port: 8080,
            rules,
        },
    });
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

afterAll(async () => {
    await testEnv.cleanup();
});

describe('gardenService - Integración con Firestore', () => {

    it('otorga 10 puntos al completar una tarea por primera vez', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        const result = await completeTaskWithReward(
            USER_A,
            'task-1',
            db
        );

        expect(result).toEqual({
            rewarded: true,
        });

        const taskSnapshot = await getDoc(
            doc(db, 'tasks', 'task-1')
        );

        const rewardSnapshot = await getDoc(
            doc(db, 'users', USER_A, 'gardenRewards', 'task-1')
        );

        const progressSnapshot = await getDoc(
            doc(db, 'users', USER_A, 'garden', 'progress')
        );

        expect(taskSnapshot.data()?.completed).toBe(true);

        expect(rewardSnapshot.exists()).toBe(true);
        expect(rewardSnapshot.data()?.points).toBe(10);

        expect(progressSnapshot.exists()).toBe(true);
        expect(progressSnapshot.data()?.growthPoints).toBe(10);
        expect(progressSnapshot.data()?.totalWaterings).toBe(1);
        expect(progressSnapshot.data()?.lastRewardTaskId).toBe('task-1');
    });


    it('no duplica los puntos al desmarcar y volver a completar una tarea', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await completeTaskWithReward(USER_A, 'task-1', db);

        // Desmarcamos la tarea.
        await updateDoc(
            doc(db, 'tasks', 'task-1'),
            {
                completed: false,
            }
        );

        // La volvemos a completar.
        const result = await completeTaskWithReward(
            USER_A,
            'task-1',
            db
        );

        expect(result).toEqual({
            rewarded: false,
        });

        const progressSnapshot = await getDoc(
            doc(db, 'users', USER_A, 'garden', 'progress')
        );

        const rewardSnapshot = await getDoc(
            doc(db, 'users', USER_A, 'gardenRewards', 'task-1')
        );

        expect(progressSnapshot.data()?.growthPoints).toBe(10);
        expect(progressSnapshot.data()?.totalWaterings).toBe(1);

        expect(rewardSnapshot.exists()).toBe(true);
    });


    it('impide completar tareas pertenecientes a otro usuario', async () => {
        await seedTask('task-1', USER_B);

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await expect(
            completeTaskWithReward(USER_A, 'task-1', db)
        ).rejects.toThrow(
            'No tenés permiso para modificar esta tarea.'
        );

        const taskSnapshot = await getDoc(
            doc(db, 'tasks', 'task-1')
        );

        expect(taskSnapshot.data()?.completed).toBe(false);

        const progressSnapshot = await getDoc(
            doc(db, 'users', USER_A, 'garden', 'progress')
        );

        expect(progressSnapshot.exists()).toBe(false);
    });


    it('conserva los puntos del jardín cuando se elimina una tarea', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await completeTaskWithReward(USER_A, 'task-1', db);

        await deleteDoc(
            doc(db, 'tasks', 'task-1')
        );

        const taskSnapshot = await getDoc(
            doc(db, 'tasks', 'task-1')
        );

        const progressSnapshot = await getDoc(
            doc(db, 'users', USER_A, 'garden', 'progress')
        );

        const rewardSnapshot = await getDoc(
            doc(db, 'users', USER_A, 'gardenRewards', 'task-1')
        );

        expect(taskSnapshot.exists()).toBe(false);

        expect(progressSnapshot.data()?.growthPoints).toBe(10);
        expect(progressSnapshot.data()?.totalWaterings).toBe(1);

        expect(rewardSnapshot.exists()).toBe(true);
    });


    it('rechaza incrementos de progreso que reutilizan una recompensa anterior', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await completeTaskWithReward(USER_A, 'task-1', db);

        const progressRef = doc(
            db,
            'users',
            USER_A,
            'garden',
            'progress'
        );

        await expect(
            updateDoc(progressRef, {
                growthPoints: 20,
                totalWaterings: 2,
                lastRewardTaskId: 'task-1',
                updatedAt: serverTimestamp(),
            })
        ).rejects.toThrow();

        const progressSnapshot = await getDoc(progressRef);

        expect(progressSnapshot.data()?.growthPoints).toBe(10);
        expect(progressSnapshot.data()?.totalWaterings).toBe(1);
    });

});