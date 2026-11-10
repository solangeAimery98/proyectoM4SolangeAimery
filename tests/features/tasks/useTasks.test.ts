import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTasks } from '../../../src/features/tasks/useTasks';
import {
    subscribeToTasks,
    addTask,
    updateTask,
    deleteTask,
} from '../../../src/features/tasks/taskService';
import { completeTaskWithReward } from '../../../src/features/garden/services/gardenService';
import { Task } from '../../../src/types/Task';
vi.mock('../../../src/features/tasks/taskService', () => ({
    subscribeToTasks: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
}));
vi.mock('../../../src/features/garden/services/gardenService', () => ({
    completeTaskWithReward: vi.fn(),
}));
const mockedSubscribeToTasks = vi.mocked(subscribeToTasks);
const mockedAddTask = vi.mocked(addTask);
const mockedUpdateTask = vi.mocked(updateTask);
const mockedDeleteTask = vi.mocked(deleteTask);
const mockedCompleteTaskWithReward = vi.mocked(completeTaskWithReward);
const mockTask: Task = {
    id: 'task-1',
    title: 'Estudiar TypeScript',
    description: 'Practicar hooks',
    completed: false,
    createdAt: {} as Task['createdAt'],
    userId: 'user-1',
};
describe('useTasks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedSubscribeToTasks.mockReturnValue(vi.fn());
        mockedAddTask.mockResolvedValue({ id: 'new-task' } as never);
        mockedUpdateTask.mockResolvedValue(undefined);
        mockedDeleteTask.mockResolvedValue(undefined);
        mockedCompleteTaskWithReward.mockResolvedValue({ rewarded: true });
    });
    it('no debe suscribirse a Firestore si no hay userId', () => {
        renderHook(() => useTasks());
        expect(mockedSubscribeToTasks).not.toHaveBeenCalled();
    });
    it('debe suscribirse a las tareas del usuario', () => {
        renderHook(() => useTasks('user-1'));
        expect(mockedSubscribeToTasks).toHaveBeenCalledWith(
            'user-1',
            expect.any(Function),
            expect.any(Function)
        );
    });
    it('debe activar loading mientras espera las tareas', () => {
        const { result } = renderHook(() => useTasks('user-1'));
        expect(result.current.loading).toBe(true);
    });
    it('debe actualizar las tareas cuando recibe datos', async () => {
        mockedSubscribeToTasks.mockImplementation(
            (_userId, onTasks) => {
                onTasks([mockTask]);
                return vi.fn();
            }
        );
        const { result } = renderHook(() => useTasks('user-1'));
        await waitFor(() => {
            expect(result.current.tasks).toEqual([mockTask]);
            expect(result.current.loading).toBe(false);
        });
    });
    it('debe manejar errores de suscripción', async () => {
        const subscriptionError = new Error('Error de conexión');
        mockedSubscribeToTasks.mockImplementation(
            (_userId, _onTasks, onError) => {
                onError(subscriptionError);
                return vi.fn();
            }
        );
        const { result } = renderHook(() => useTasks('user-1'));
        await waitFor(() => {
            expect(result.current.error).toBe('Error de conexión');
            expect(result.current.loading).toBe(false);
        });
    });
    it('debe crear una tarea con los datos normalizados', async () => {
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.addTask('  Nueva tarea  ', '  Descripción  ');
        });
        expect(mockedAddTask).toHaveBeenCalledWith({
            title: 'Nueva tarea',
            description: 'Descripción',
            completed: false,
            userId: 'user-1',
        });
    });
    it('no debe crear tareas si no hay userId', async () => {
        const { result } = renderHook(() => useTasks());
        await act(async () => {
            await result.current.addTask('Nueva tarea');
        });
        expect(mockedAddTask).not.toHaveBeenCalled();
    });
    it('debe completar una tarea utilizando el servicio de recompensas', async () => {
        const { result } = renderHook(() => useTasks('user-1'));
        let success = false;
        await act(async () => {
            success = await result.current.toggleTask('task-1', true);
        });
        expect(mockedCompleteTaskWithReward).toHaveBeenCalledWith(
            'user-1',
            'task-1'
        );
        expect(mockedUpdateTask).not.toHaveBeenCalled();
        expect(success).toBe(true);
    });
    it('debe descompletar una tarea sin generar recompensas', async () => {
        const { result } = renderHook(() => useTasks('user-1'));
        let success = false;
        await act(async () => {
            success = await result.current.toggleTask('task-1', false);
        });
        expect(mockedUpdateTask).toHaveBeenCalledWith('task-1', {
            completed: false,
        });
        expect(mockedCompleteTaskWithReward).not.toHaveBeenCalled();
        expect(success).toBe(true);
    });
    it('no debe completar tareas si no hay userId', async () => {
        const { result } = renderHook(() => useTasks());
        let success = true;
        await act(async () => {
            success = await result.current.toggleTask('task-1', true);
        });
        expect(mockedCompleteTaskWithReward).not.toHaveBeenCalled();
        expect(mockedUpdateTask).not.toHaveBeenCalled();
        expect(success).toBe(false);
    });
    it('debe editar una tarea normalizando sus campos', async () => {
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.editTask(
                'task-1',
                '  Título actualizado  ',
                '  Nueva descripción  '
            );
        });
        expect(mockedUpdateTask).toHaveBeenCalledWith('task-1', {
            title: 'Título actualizado',
            description: 'Nueva descripción',
        });
    });
    it('debe eliminar una tarea', async () => {
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.deleteTask('task-1');
        });
        expect(mockedDeleteTask).toHaveBeenCalledWith('task-1');
    });
    it('debe cancelar la suscripción al desmontar el hook', () => {
        const unsubscribe = vi.fn();
        mockedSubscribeToTasks.mockReturnValue(unsubscribe);
        const { unmount } = renderHook(() => useTasks('user-1'));
        unmount();
        expect(unsubscribe).toHaveBeenCalledOnce();
    });
    it('debe limpiar las tareas cuando no hay userId', async () => {
        const { result, rerender } = renderHook(
            ({ userId }) => useTasks(userId),
            { initialProps: { userId: 'user-1' as string | undefined } }
        );
        const subscriptionCallback = mockedSubscribeToTasks.mock.calls[0][1];
        act(() => {
            subscriptionCallback([mockTask]);
        });
        expect(result.current.tasks).toEqual([mockTask]);
        rerender({ userId: undefined });
        await waitFor(() => {
            expect(result.current.tasks).toEqual([]);
            expect(result.current.loading).toBe(false);
        });
    });
    it('debe guardar el error si falla la creación de una tarea', async () => {
        mockedAddTask.mockRejectedValue(new Error('No se pudo crear'));
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.addTask('Nueva tarea');
        });
        expect(result.current.error).toBe('No se pudo crear');
    });
    it('debe guardar el error si falla la recompensa al completar una tarea', async () => {
        mockedCompleteTaskWithReward.mockRejectedValue(
            new Error('No se pudo actualizar')
        );
        const { result } = renderHook(() => useTasks('user-1'));
        let success = true;
        await act(async () => {
            success = await result.current.toggleTask('task-1', true);
        });
        expect(result.current.error).toBe('No se pudo actualizar');
        expect(success).toBe(false);
    });
    it('debe manejar errores al descompletar una tarea', async () => {
        mockedUpdateTask.mockRejectedValue(
            new Error('No se pudo descompletar')
        );
        const { result } = renderHook(() => useTasks('user-1'));
        let success = true;
        await act(async () => {
            success = await result.current.toggleTask('task-1', false);
        });
        expect(result.current.error).toBe('No se pudo descompletar');
        expect(success).toBe(false);
    });
    it('debe guardar el error si falla la eliminación de una tarea', async () => {
        mockedDeleteTask.mockRejectedValue(new Error('No se pudo eliminar'));
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.deleteTask('task-1');
        });
        expect(result.current.error).toBe('No se pudo eliminar');
    });
    it('debe mostrar un mensaje predeterminado cuando la suscripción falla sin mensaje', async () => {
        mockedSubscribeToTasks.mockImplementation(
            (_userId, _onTasks, onError) => {
                onError({ message: '' } as Error);
                return vi.fn();
            }
        );
        const { result } = renderHook(() => useTasks('user-1'));
        await waitFor(() => {
            expect(result.current.error).toBe(
                'No se pudieron cargar las tareas.'
            );
        });
    });
    it('debe manejar errores desconocidos al crear una tarea', async () => {
        mockedAddTask.mockRejectedValue('Error desconocido');
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.addTask('Nueva tarea');
        });
        expect(result.current.error).toBe(
            'No se pudo crear la tarea.'
        );
    });
    it('debe manejar errores desconocidos al completar una tarea', async () => {
        mockedCompleteTaskWithReward.mockRejectedValue('Error desconocido');
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.toggleTask('task-1', true);
        });
        expect(result.current.error).toBe(
            'No se pudo actualizar la tarea.'
        );
    });
    it('debe manejar errores desconocidos al editar una tarea', async () => {
        mockedUpdateTask.mockRejectedValue('Error desconocido');
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.editTask(
                'task-1',
                'Nuevo título',
                'Nueva descripción'
            );
        });
        expect(result.current.error).toBe(
            'No se pudo editar la tarea.'
        );
    });
    it('debe manejar errores desconocidos al eliminar una tarea', async () => {
        mockedDeleteTask.mockRejectedValue('Error desconocido');
        const { result } = renderHook(() => useTasks('user-1'));
        await act(async () => {
            await result.current.deleteTask('task-1');
        });
        expect(result.current.error).toBe(
            'No se pudo eliminar la tarea.'
        );
    });
    it('debe cancelar la suscripción anterior cuando cambia el usuario', () => {
        const unsubscribeFirst = vi.fn();
        const unsubscribeSecond = vi.fn();
        mockedSubscribeToTasks
            .mockReturnValueOnce(unsubscribeFirst)
            .mockReturnValueOnce(unsubscribeSecond);
        const { rerender, unmount } = renderHook(
            ({ userId }) => useTasks(userId),
            { initialProps: { userId: 'user-1' } }
        );
        rerender({ userId: 'user-2' });
        expect(unsubscribeFirst).toHaveBeenCalledOnce();
        expect(mockedSubscribeToTasks).toHaveBeenCalledTimes(2);
        expect(mockedSubscribeToTasks).toHaveBeenLastCalledWith(
            'user-2',
            expect.any(Function),
            expect.any(Function)
        );
        unmount();
        expect(unsubscribeSecond).toHaveBeenCalledOnce();
    });
});