import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timestamp } from 'firebase/firestore';
import { TodoItem } from '../../src/components/TodoItem';
import { Task } from '../../src/types/Task';
describe('TodoItem', () => {
    const task: Task = {
        id: 'task-1',
        title: 'Estudiar React',
        description: 'Practicar componentes',
        completed: false,
        createdAt: Timestamp.fromDate(new Date()),
        userId: 'user-1',
    };
    it('debería mostrar el título y la descripción de la tarea', () => {
        render(
            <TodoItem
                task={task}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={vi.fn().mockResolvedValue(true)}
            />
        );
        expect(screen.getByText('Estudiar React')).toBeInTheDocument();
        expect(screen.getByText('Practicar componentes')).toBeInTheDocument();
    });
    it('debería mostrar el checkbox desmarcado cuando la tarea no está completada', () => {
        render(
            <TodoItem
                task={task}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={vi.fn().mockResolvedValue(true)}
            />
        );
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
    it('debería llamar a onToggle con el ID y el nuevo estado', async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();
        render(
            <TodoItem
                task={task}
                onToggle={onToggle}
                onDelete={vi.fn()}
                onEdit={vi.fn().mockResolvedValue(true)}
            />
        );
        await user.click(screen.getByRole('checkbox'));
        expect(onToggle).toHaveBeenCalledOnce();
        expect(onToggle).toHaveBeenCalledWith('task-1', true);
    });
    it('debería mostrar el checkbox marcado cuando la tarea está completada', () => {
        const completedTask = {
            ...task,
            completed: true,
        };
        render(
            <TodoItem
                task={completedTask}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={vi.fn().mockResolvedValue(true)}
            />
        );
        expect(screen.getByRole('checkbox')).toBeChecked();
    });
    it('debería llamar a onDelete con el ID de la tarea', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        render(
            <TodoItem
                task={task}
                onToggle={vi.fn()}
                onDelete={onDelete}
                onEdit={vi.fn().mockResolvedValue(true)}
            />
        );
        await user.click(
            screen.getByRole('button', {
                name: 'Eliminar Estudiar React',
            })
        );
        expect(onDelete).toHaveBeenCalledOnce();
        expect(onDelete).toHaveBeenCalledWith('task-1');
    });
    it('debería permitir editar y guardar el título y la descripción', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn().mockResolvedValue(true);
        render(
            <TodoItem
                task={task}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={onEdit}
            />
        );
        await user.click(
            screen.getByRole('button', {
                name: 'Editar Estudiar React',
            })
        );
        const titleInput = screen.getByRole('textbox', {
            name: 'Nombre de la tarea',
        });
        const descriptionInput = screen.getByRole('textbox', {
            name: 'Descripción (opcional)',
        });
        await user.clear(titleInput);
        await user.type(titleInput, 'Nuevo título');
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'Nueva descripción');
        await user.click(
            screen.getByRole('button', {
                name: 'Guardar cambios',
            })
        );
        expect(onEdit).toHaveBeenCalledOnce();
        expect(onEdit).toHaveBeenCalledWith(
            'task-1',
            'Nuevo título',
            'Nueva descripción'
        );
        await waitFor(() => {
            expect(
                screen.queryByRole('textbox', {
                    name: 'Nombre de la tarea',
                })
            ).not.toBeInTheDocument();
        });
    });
    it('debería cancelar la edición y recuperar los valores originales', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn().mockResolvedValue(true);
        render(
            <TodoItem
                task={task}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={onEdit}
            />
        );
        await user.click(
            screen.getByRole('button', {
                name: 'Editar Estudiar React',
            })
        );
        const titleInput = screen.getByRole('textbox', {
            name: 'Nombre de la tarea',
        });
        await user.clear(titleInput);
        await user.type(titleInput, 'Título temporal');
        await user.click(
            screen.getByRole('button', {
                name: 'Cancelar',
            })
        );
        expect(screen.getByText('Estudiar React')).toBeInTheDocument();
        expect(onEdit).not.toHaveBeenCalled();
    });
    it('no debería guardar una tarea si el título contiene solamente espacios', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn().mockResolvedValue(true);
        render(
            <TodoItem
                task={task}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={onEdit}
            />
        );
        await user.click(
            screen.getByRole('button', {
                name: 'Editar Estudiar React',
            })
        );
        const titleInput = screen.getByRole('textbox', {
            name: 'Nombre de la tarea',
        });
        await user.clear(titleInput);
        await user.type(titleInput, '   ');
        await user.click(
            screen.getByRole('button', {
                name: 'Guardar cambios',
            })
        );
        expect(onEdit).not.toHaveBeenCalled();
    });
});