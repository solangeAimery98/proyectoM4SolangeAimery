import { readFileSync } from 'node:fs';

import {
    initializeTestEnvironment,
    RulesTestEnvironment,
    assertSucceeds,
    assertFails,
} from '@firebase/rules-unit-testing';

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
} from 'firebase/firestore';

import {
    beforeAll,
    beforeEach,
    afterAll,
    describe,
    it,
    expect,
} from 'vitest';

let testEnv: RulesTestEnvironment;

const PROJECT_ID = 'task-manager-henry-test';

const USER_A = 'user-a';
const USER_B = 'user-b';

const createTask = (userId: string) => ({
    title: 'Estudiar React',
    description: 'Practicar componentes',
    completed: false,
    userId,
    createdAt: serverTimestamp(),
});

const seedTask = async (
    taskId: string,
    userId: string = USER_A
) => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(
            doc(context.firestore(), `tasks/${taskId}`),
            {
                title: 'Estudiar React',
                description: 'Practicar componentes',
                completed: false,
                userId,
                createdAt: new Date(),
            }
        );
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

describe('Firestore Security Rules', () => {
    describe('Lectura de tareas', () => {
        it('permite que un usuario lea sus propias tareas', async () => {
            await seedTask('task-1');

            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertSucceeds(
                getDoc(doc(db, 'tasks/task-1'))
            );
        });

        it('impide que un usuario lea tareas de otro usuario', async () => {
            await seedTask('task-1');

            const db = testEnv.authenticatedContext(USER_B).firestore();

            await assertFails(
                getDoc(doc(db, 'tasks/task-1'))
            );
        });

        it('impide que un usuario no autenticado lea tareas', async () => {
            await seedTask('task-1');

            const db = testEnv.unauthenticatedContext().firestore();

            await assertFails(
                getDoc(doc(db, 'tasks/task-1'))
            );
        });

        it('permite consultar únicamente las tareas propias', async () => {
            await seedTask('task-1', USER_A);
            await seedTask('task-2', USER_B);

            const db = testEnv.authenticatedContext(USER_A).firestore();

            const ownTasksQuery = query(
                collection(db, 'tasks'),
                where('userId', '==', USER_A)
            );

            const result = await assertSucceeds(
                getDocs(ownTasksQuery)
            );

            expect(result.docs).toHaveLength(1);
            expect(result.docs[0].data().userId).toBe(USER_A);
        });

        it('impide consultar todas las tareas sin filtrar por usuario', async () => {
            await seedTask('task-1', USER_A);
            await seedTask('task-2', USER_B);

            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertFails(
                getDocs(collection(db, 'tasks'))
            );
        });
    });

    describe('Creación de tareas', () => {
        it('permite crear una tarea propia con datos válidos', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertSucceeds(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    createTask(USER_A)
                )
            );
        });

        it('impide crear tareas asignadas a otro usuario', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertFails(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    createTask(USER_B)
                )
            );
        });

        it('impide crear tareas sin título', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertFails(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    {
                        ...createTask(USER_A),
                        title: '',
                    }
                )
            );
        });

        it('permite títulos de hasta 100 caracteres', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertSucceeds(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    {
                        ...createTask(USER_A),
                        title: 'A'.repeat(100),
                    }
                )
            );
        });

        it('rechaza títulos de más de 100 caracteres', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertFails(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    {
                        ...createTask(USER_A),
                        title: 'A'.repeat(101),
                    }
                )
            );
        });

        it('rechaza títulos con espacios al principio o al final', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertFails(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    {
                        ...createTask(USER_A),
                        title: ' Estudiar React ',
                    }
                )
            );
        });

        it('permite descripciones de hasta 500 caracteres', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertSucceeds(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    {
                        ...createTask(USER_A),
                        description: 'A'.repeat(500),
                    }
                )
            );
        });

        it('rechaza descripciones de más de 500 caracteres', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertFails(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    {
                        ...createTask(USER_A),
                        description: 'A'.repeat(501),
                    }
                )
            );
        });

        it('impide crear tareas con campos adicionales', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            await assertFails(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    {
                        ...createTask(USER_A),
                        isAdmin: true,
                    }
                )
            );
        });

        it('impide crear tareas sin campos obligatorios', async () => {
            const db = testEnv.authenticatedContext(USER_A).firestore();

            const task = createTask(USER_A);
            const { description, ...taskWithoutDescription } = task;

            await assertFails(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    taskWithoutDescription
                )
            );
        });

        it('impide crear tareas sin autenticación', async () => {
            const db = testEnv.unauthenticatedContext().firestore();

            await assertFails(
                setDoc(
                    doc(db, 'tasks/task-new'),
                    createTask(USER_A)
                )
            );
        });
    });

    it('impide completar una tarea sin registrar su recompensa', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await assertFails(
            updateDoc(
                doc(db, 'tasks/task-1'),
                {
                    completed: true,
                }
            )
        );
    });

    it('impide modificar tareas de otro usuario', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_B).firestore();

        await assertFails(
            updateDoc(
                doc(db, 'tasks/task-1'),
                {
                    completed: true,
                }
            )
        );
    });

    it('impide modificar el userId', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await assertFails(
            updateDoc(
                doc(db, 'tasks/task-1'),
                {
                    userId: USER_B,
                }
            )
        );
    });

    it('impide modificar createdAt', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await assertFails(
            updateDoc(
                doc(db, 'tasks/task-1'),
                {
                    createdAt: new Date(),
                }
            )
        );
    });

    it('rechaza actualizaciones con títulos demasiado largos', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await assertFails(
            updateDoc(
                doc(db, 'tasks/task-1'),
                {
                    title: 'A'.repeat(101),
                }
            )
        );
    });

    it('rechaza actualizaciones con descripciones demasiado largas', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await assertFails(
            updateDoc(
                doc(db, 'tasks/task-1'),
                {
                    description: 'A'.repeat(501),
                }
            )
        );
    });

    it('impide modificar campos adicionales', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await assertFails(
            updateDoc(
                doc(db, 'tasks/task-1'),
                {
                    isAdmin: true,
                }
            )
        );
    });

    it('impide actualizar tareas sin autenticación', async () => {
        await seedTask('task-1');

        const db = testEnv.unauthenticatedContext().firestore();

        await assertFails(
            updateDoc(
                doc(db, 'tasks/task-1'),
                {
                    completed: true,
                }
            )
        );
    });
});

describe('Eliminación de tareas', () => {
    it('permite eliminar tareas propias', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_A).firestore();

        await assertSucceeds(
            deleteDoc(doc(db, 'tasks/task-1'))
        );
    });

    it('impide eliminar tareas de otro usuario', async () => {
        await seedTask('task-1');

        const db = testEnv.authenticatedContext(USER_B).firestore();

        await assertFails(
            deleteDoc(doc(db, 'tasks/task-1'))
        );
    });

    it('impide eliminar tareas sin autenticación', async () => {
        await seedTask('task-1');

        const db = testEnv.unauthenticatedContext().firestore();

        await assertFails(
            deleteDoc(doc(db, 'tasks/task-1'))
        );
    });
});
