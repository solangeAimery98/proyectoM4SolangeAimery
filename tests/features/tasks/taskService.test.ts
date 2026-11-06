import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';

import { db } from '../../../src/services/firebase/config';

import {
    subscribeToTasks,
    addTask,
    updateTask,
    deleteTask,
} from '../../../src/features/tasks/taskService';

import { NewTask } from '../../../src/types/Task';

// Creamos mocks para las funciones de Firestore
const firestoreMocks = vi.hoisted(() => ({
    collection: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    serverTimestamp: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
    collection: firestoreMocks.collection,
    addDoc: firestoreMocks.addDoc,
    updateDoc: firestoreMocks.updateDoc,
    deleteDoc: firestoreMocks.deleteDoc,
    doc: firestoreMocks.doc,
    query: firestoreMocks.query,
    where: firestoreMocks.where,
    onSnapshot: firestoreMocks.onSnapshot,
    serverTimestamp: firestoreMocks.serverTimestamp,
    Timestamp: class Timestamp { },
}));

vi.mock('../../../src/services/firebase/config', () => ({
    db: {},
}));

describe('taskService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        firestoreMocks.collection.mockReturnValue('tasks-collection');
        firestoreMocks.query.mockReturnValue('filtered-query');
        firestoreMocks.where.mockReturnValue('user-filter');
        firestoreMocks.doc.mockReturnValue('task-reference');
        firestoreMocks.serverTimestamp.mockReturnValue('server-timestamp');

        firestoreMocks.addDoc.mockResolvedValue({ id: 'new-task' });
        firestoreMocks.updateDoc.mockResolvedValue(undefined);
        firestoreMocks.deleteDoc.mockResolvedValue(undefined);
        firestoreMocks.onSnapshot.mockReturnValue(vi.fn());
    });

    describe('subscribeToTasks', () => {
        it('debe consultar la colección tasks', () => {
            subscribeToTasks('user-1', vi.fn(), vi.fn());

            expect(collection).toHaveBeenCalledWith(db, 'tasks');
        });

        it('debe filtrar las tareas por userId', () => {
            subscribeToTasks('user-1', vi.fn(), vi.fn());

            expect(where).toHaveBeenCalledWith('userId', '==', 'user-1');
        });

        it('debe transformar los documentos y enviarlos mediante onTasks', () => {
            const onTasks = vi.fn();
            const onError = vi.fn();

            subscribeToTasks('user-1', onTasks, onError);

            const snapshotCallback = firestoreMocks.onSnapshot.mock.calls[0][1];

            snapshotCallback({
                docs: [
                    {
                        id: 'task-1',
                        data: () => ({
                            title: 'Estudiar React',
                            description: 'Practicar testing',
                            completed: false,
                            userId: 'user-1',
                        }),
                    },
                ],
            });

            expect(onTasks).toHaveBeenCalledWith([
                {
                    id: 'task-1',
                    title: 'Estudiar React',
                    description: 'Practicar testing',
                    completed: false,
                    userId: 'user-1',
                },
            ]);
        });

        it('debe propagar los errores de la suscripción', () => {
            const onTasks = vi.fn();
            const onError = vi.fn();
            const subscriptionError = new Error('Error de Firestore');

            subscribeToTasks('user-1', onTasks, onError);

            const errorCallback = firestoreMocks.onSnapshot.mock.calls[0][2];

            errorCallback(subscriptionError);

            expect(onError).toHaveBeenCalledWith(subscriptionError);
        });

        it('debe devolver la función para cancelar la suscripción', () => {
            const unsubscribe = vi.fn();

            firestoreMocks.onSnapshot.mockReturnValue(unsubscribe);

            const result = subscribeToTasks('user-1', vi.fn(), vi.fn());

            expect(result).toBe(unsubscribe);
        });
    });

    describe('addTask', () => {
        it('debe crear una tarea con fecha generada por Firestore', async () => {
            const newTask: NewTask = {
                title: 'Nueva tarea',
                description: 'Descripción',
                completed: false,
                userId: 'user-1',
            };

            await addTask(newTask);

            expect(collection).toHaveBeenCalledWith(db, 'tasks');

            expect(serverTimestamp).toHaveBeenCalled();

            expect(addDoc).toHaveBeenCalledWith('tasks-collection', {
                ...newTask,
                createdAt: 'server-timestamp',
            });
        });

        it('debe devolver el resultado de Firestore', async () => {
            const newTask: NewTask = {
                title: 'Nueva tarea',
                description: '',
                completed: false,
                userId: 'user-1',
            };

            const result = await addTask(newTask);

            expect(result).toEqual({ id: 'new-task' });
        });

        it('debe propagar los errores al crear una tarea', async () => {
            const error = new Error('No se pudo crear');
            firestoreMocks.addDoc.mockRejectedValue(error);

            const newTask: NewTask = {
                title: 'Nueva tarea',
                description: '',
                completed: false,
                userId: 'user-1',
            };

            await expect(addTask(newTask)).rejects.toThrow('No se pudo crear');
        });
    });

    describe('updateTask', () => {
        it('debe actualizar el documento indicado', async () => {
            await updateTask('task-1', {
                completed: true,
            });

            expect(doc).toHaveBeenCalledWith(db, 'tasks', 'task-1');

            expect(updateDoc).toHaveBeenCalledWith('task-reference', {
                completed: true,
            });
        });

        it('debe propagar los errores al actualizar una tarea', async () => {
            firestoreMocks.updateDoc.mockRejectedValue(
                new Error('No se pudo actualizar')
            );

            await expect(
                updateTask('task-1', { completed: true })
            ).rejects.toThrow('No se pudo actualizar');
        });
    });

    describe('deleteTask', () => {
        it('debe eliminar el documento indicado', async () => {
            await deleteTask('task-1');

            expect(doc).toHaveBeenCalledWith(db, 'tasks', 'task-1');

            expect(deleteDoc).toHaveBeenCalledWith('task-reference');
        });

        it('debe propagar los errores al eliminar una tarea', async () => {
            firestoreMocks.deleteDoc.mockRejectedValue(
                new Error('No se pudo eliminar')
            );

            await expect(deleteTask('task-1')).rejects.toThrow(
                'No se pudo eliminar'
            );
        });
    });
});