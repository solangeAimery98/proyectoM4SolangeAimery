import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';

import { Register } from '../../src/pages/Register';
import { registerUser } from '../../src/features/auth/authService';

const { mockNavigate } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
}));

vi.mock('../../src/features/auth/authService', () => ({
    registerUser: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockedRegisterUser = vi.mocked(registerUser);

const renderRegister = () => {
    return render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>
    );
};

describe('Register', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe renderizar los campos y el botón de registro', () => {
        renderRegister();

        expect(
            screen.getByLabelText('Correo electrónico')
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Contraseña')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', { name: /Crear mi cuenta/ })
        ).toBeInTheDocument();
    });

    it('debe permitir escribir en los campos', async () => {
        const user = userEvent.setup();

        renderRegister();

        const emailInput = screen.getByLabelText('Correo electrónico');
        const passwordInput = screen.getByLabelText('Contraseña');

        await user.type(emailInput, 'test@email.com');
        await user.type(passwordInput, 'password123');

        expect(emailInput).toHaveValue('test@email.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('debe llamar a registerUser con las credenciales ingresadas', async () => {
        const user = userEvent.setup();

        mockedRegisterUser.mockResolvedValue(
            {} as Awaited<ReturnType<typeof registerUser>>
        );

        renderRegister();

        await user.type(
            screen.getByLabelText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByLabelText('Contraseña'),
            'password123'
        );

        await user.click(
            screen.getByRole('button', { name: /Crear mi cuenta/ })
        );

        await waitFor(() => {
            expect(mockedRegisterUser).toHaveBeenCalledWith(
                'test@email.com',
                'password123'
            );
        });
    });

    it('debe redirigir al inicio cuando el registro es exitoso', async () => {
        const user = userEvent.setup();

        mockedRegisterUser.mockResolvedValue(
            {} as Awaited<ReturnType<typeof registerUser>>
        );

        renderRegister();

        await user.type(
            screen.getByLabelText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByLabelText('Contraseña'),
            'password123'
        );

        await user.click(
            screen.getByRole('button', { name: /Crear mi cuenta/ })
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('debe rechazar contraseñas de menos de 6 caracteres', async () => {
        const user = userEvent.setup();

        renderRegister();

        await user.type(
            screen.getByLabelText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByLabelText('Contraseña'),
            '12345'
        );

        await user.click(
            screen.getByRole('button', { name: /Crear mi cuenta/ })
        );

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'La contraseña debe tener al menos 6 caracteres.'
        );

        expect(mockedRegisterUser).not.toHaveBeenCalled();
    });

    it('debe mostrar un mensaje si Firebase rechaza el registro', async () => {
        const user = userEvent.setup();

        const firebaseError = new FirebaseError(
            'auth/email-already-in-use',
            'Email already registered'
        );

        mockedRegisterUser.mockRejectedValue(firebaseError);

        renderRegister();

        await user.type(
            screen.getByLabelText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByLabelText('Contraseña'),
            'password123'
        );

        await user.click(
            screen.getByRole('button', { name: /Crear mi cuenta/ })
        );

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Este correo electrónico ya tiene una cuenta.'
        );
    });

    it('debe deshabilitar el botón mientras se procesa el registro', async () => {
        const user = userEvent.setup();

        let resolveRegister!: (
            value: Awaited<ReturnType<typeof registerUser>>
        ) => void;

        mockedRegisterUser.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRegister = resolve;
                })
        );

        renderRegister();

        await user.type(
            screen.getByLabelText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByLabelText('Contraseña'),
            'password123'
        );

        await user.click(
            screen.getByRole('button', { name: /Crear mi cuenta/ })
        );

        expect(
            screen.getByRole('button', { name: /Creando cuenta/ })
        ).toBeDisabled();

        resolveRegister({} as Awaited<ReturnType<typeof registerUser>>);
    });
});