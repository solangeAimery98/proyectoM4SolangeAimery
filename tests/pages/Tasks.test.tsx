import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tasks } from '../../src/pages/Tasks';
import { useAuth } from '../../src/features/auth/AuthContext';
import { useTasks } from '../../src/features/tasks/useTasks';
import type { Task } from '../../src/types/Task';

const mocks = vi.hoisted(() => ({
    addTask: vi.fn(),
    toggleTask: vi.fn(),
    editTask: vi.fn(),
    deleteTask: vi.fn(),
}));

vi.mock('../../src/features/auth/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../src/features/tasks/useTasks', () => ({
    useTasks: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseTasks = vi.mocked(useTasks);

const mockTask: Task = {
    id: 'task-1',
    title: 'Estudiar React',
    description: 'Repasar componentes',
    completed: false,
    createdAt: null,
    userId: 'user-123',
};

const configureTasks = (overrides = {}) => {
    mockedUseTasks.mockReturnValue({
        tasks: [mockTask],
        loading: false,
        error: null,
        addTask: mocks.addTask,
        toggleTask: mocks.toggleTask,
        editTask: mocks.editTask,
        deleteTask: mocks.deleteTask,
        ...overrides,
    } as ReturnType<typeof useTasks>);
};

describe('Tasks', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseAuth.mockReturnValue({
            currentUser: {
                uid: 'user-123',
                email: 'test@email.com',
            } as ReturnType<typeof useAuth>['currentUser'],
            loading: false,
        });

        configureTasks();
    });

    it('debe mostrar el saludo y el formulario de tareas', () => {
        render(<Tasks />);

        expect(
            screen.getByRole('heading', {
                name: '¡Hola, test!',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('textbox', {
                name: 'Nombre de la tarea',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('textbox', {
                name: 'Descripción (opcional)',
            })
        ).toBeInTheDocument();
    });

    it('debe mostrar un mensaje mientras se cargan las tareas', () => {
        configureTasks({ loading: true });

        render(<Tasks />);

        expect(
            screen.getByText('Cargando tareas...')
        ).toBeInTheDocument();

        expect(
            screen.queryByText('Estudiar React')
        ).not.toBeInTheDocument();
    });

    it('debe mostrar la lista cuando termina la carga', () => {
        render(<Tasks />);

        expect(
            screen.getByText('Estudiar React')
        ).toBeInTheDocument();

        expect(
            screen.getByText('Repasar componentes')
        ).toBeInTheDocument();
    });

    it('debe mostrar el estado vacío cuando no existen tareas', () => {
        configureTasks({ tasks: [] });

        render(<Tasks />);

        expect(
            screen.getByRole('status')
        ).toHaveTextContent(
            'Todavía no tenés tareas. ¡Creá la primera!'
        );
    });

    it('debe mostrar un mensaje cuando existe un error', () => {
        configureTasks({
            error: 'No se pudieron cargar las tareas.',
        });

        render(<Tasks />);

        expect(
            screen.getByRole('alert')
        ).toHaveTextContent(
            'No se pudieron cargar las tareas.'
        );
    });

    it('debe pasar el UID del usuario autenticado a useTasks', () => {
        render(<Tasks />);

        expect(mockedUseTasks).toHaveBeenCalledWith('user-123');
    });

    it('debe conectar el formulario con la función addTask', async () => {
        const user = userEvent.setup();

        render(<Tasks />);

        await user.type(
            screen.getByRole('textbox', {
                name: 'Nombre de la tarea',
            }),
            'Nueva tarea'
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Agregar tarea',
            })
        );

        expect(mocks.addTask).toHaveBeenCalledWith(
            'Nueva tarea',
            ''
        );
    });

    it('debe conectar las acciones de la lista con sus funciones correspondientes', async () => {
        const user = userEvent.setup();

        render(<Tasks />);

        await user.click(
            screen.getByRole('checkbox', {
                name: 'Completar Estudiar React',
            })
        );

        expect(mocks.toggleTask).toHaveBeenCalledWith(
            'task-1',
            true
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Eliminar Estudiar React',
            })
        );

        expect(mocks.deleteTask).toHaveBeenCalledWith('task-1');
    });
});