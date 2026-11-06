import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../../src/components/TodoForm';

describe('TodoForm', () => {
    it('debería renderizar los campos y el botón de agregar', () => {
        const onAdd = vi.fn();

        render(<TodoForm onAdd={onAdd} />);

        expect(screen.getByPlaceholderText('Nueva tarea...')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('Descripción (opcional)...')
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument();
    });

    it('debería permitir escribir en los campos', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();

        render(<TodoForm onAdd={onAdd} />);

        const titleInput = screen.getByPlaceholderText('Nueva tarea...');
        const descriptionInput = screen.getByPlaceholderText(
            'Descripción (opcional)...'
        );

        await user.type(titleInput, 'Estudiar TypeScript');
        await user.type(descriptionInput, 'Practicar interfaces y tipos');

        expect(titleInput).toHaveValue('Estudiar TypeScript');
        expect(descriptionInput).toHaveValue('Practicar interfaces y tipos');
    });

    it('debería llamar a onAdd con el título y la descripción ingresados', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();

        render(<TodoForm onAdd={onAdd} />);

        await user.type(
            screen.getByPlaceholderText('Nueva tarea...'),
            'Estudiar React'
        );

        await user.type(
            screen.getByPlaceholderText('Descripción (opcional)...'),
            'Repasar componentes'
        );

        await user.click(screen.getByRole('button', { name: 'Agregar' }));

        expect(onAdd).toHaveBeenCalledOnce();
        expect(onAdd).toHaveBeenCalledWith(
            'Estudiar React',
            'Repasar componentes'
        );
    });

    it('debería eliminar los espacios sobrantes antes de llamar a onAdd', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();

        render(<TodoForm onAdd={onAdd} />);

        await user.type(
            screen.getByPlaceholderText('Nueva tarea...'),
            '   Estudiar React   '
        );

        await user.type(
            screen.getByPlaceholderText('Descripción (opcional)...'),
            '   Practicar hooks   '
        );

        await user.click(screen.getByRole('button', { name: 'Agregar' }));

        expect(onAdd).toHaveBeenCalledWith(
            'Estudiar React',
            'Practicar hooks'
        );
    });

    it('debería limpiar los campos después de agregar una tarea', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();

        render(<TodoForm onAdd={onAdd} />);

        const titleInput = screen.getByPlaceholderText('Nueva tarea...');
        const descriptionInput = screen.getByPlaceholderText(
            'Descripción (opcional)...'
        );

        await user.type(titleInput, 'Estudiar React');
        await user.type(descriptionInput, 'Practicar componentes');

        await user.click(screen.getByRole('button', { name: 'Agregar' }));

        expect(titleInput).toHaveValue('');
        expect(descriptionInput).toHaveValue('');
    });

    it('no debería agregar una tarea si el título contiene solamente espacios', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();

        render(<TodoForm onAdd={onAdd} />);

        await user.type(
            screen.getByPlaceholderText('Nueva tarea...'),
            '   '
        );

        await user.click(screen.getByRole('button', { name: 'Agregar' }));

        expect(onAdd).not.toHaveBeenCalled();
    });
});