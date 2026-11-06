import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timestamp } from 'firebase/firestore';
import { TodoList } from '../../src/components/TodoList';
import { Task } from '../../src/types/Task';

describe('TodoList', () => {
    const tasks: Task[] = [
        {
            id: 'task-1',
            title: 'Estudiar React',
            description: 'Practicar componentes',
            completed: false,
            createdAt: Timestamp.fromDate(new Date()),
            userId: 'user-1',
        },
        {
            id: 'task-2',
            title: 'Estudiar TypeScript',
            description: 'Practicar interfaces',
            completed: true,
            createdAt: Timestamp.fromDate(new Date()),
            userId: 'user-1',
        },
    ];

    it('debería mostrar un mensaje cuando no hay tareas', () => {
        render(
            <TodoList
                tasks={[]}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={vi.fn()}
            />
        );

        expect(screen.getByText('No hay tareas pendientes.')).toBeInTheDocument();
    });

    it('debería renderizar todas las tareas recibidas', () => {
        render(
            <TodoList
                tasks={tasks}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={vi.fn()}
            />
        );

        expect(screen.getByText('Estudiar React')).toBeInTheDocument();
        expect(screen.getByText('Estudiar TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Practicar componentes')).toBeInTheDocument();
        expect(screen.getByText('Practicar interfaces')).toBeInTheDocument();
    });

    it('debería llamar a onToggle con el ID y el nuevo estado de la tarea', async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();

        render(
            <TodoList
                tasks={tasks}
                onToggle={onToggle}
                onDelete={vi.fn()}
                onEdit={vi.fn()}
            />
        );

        const checkbox = screen.getByRole('checkbox', {
            name: /estudiar react/i,
        });

        await user.click(checkbox);

        expect(onToggle).toHaveBeenCalledOnce();
        expect(onToggle).toHaveBeenCalledWith('task-1', true);
    });

    it('debería llamar a onDelete con el ID de la tarea correspondiente', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();

        render(
            <TodoList
                tasks={tasks}
                onToggle={vi.fn()}
                onDelete={onDelete}
                onEdit={vi.fn()}
            />
        );

        const taskItem = screen
            .getByText('Estudiar React')
            .closest('li');

        expect(taskItem).not.toBeNull();

        const deleteButton = screen.getAllByRole('button', {
            name: 'Eliminar',
        })[0];

        await user.click(deleteButton);

        expect(onDelete).toHaveBeenCalledOnce();
        expect(onDelete).toHaveBeenCalledWith('task-1');
    });

    it('debería llamar a onEdit con los datos modificados de la tarea', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();

        render(
            <TodoList
                tasks={tasks}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={onEdit}
            />
        );

        const taskItem = screen
            .getByText('Estudiar React')
            .closest('li');

        expect(taskItem).not.toBeNull();

        await user.click(
            screen.getAllByRole('button', { name: 'Editar' })[0]
        );

        const titleInput = screen.getByRole('textbox', {
            name: 'Título de la tarea',
        });

        const descriptionInput = screen.getByRole('textbox', {
            name: 'Descripción de la tarea',
        });

        await user.clear(titleInput);
        await user.type(titleInput, 'Estudiar React avanzado');

        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'Practicar testing');

        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(onEdit).toHaveBeenCalledOnce();
        expect(onEdit).toHaveBeenCalledWith(
            'task-1',
            'Estudiar React avanzado',
            'Practicar testing'
        );
    });
});