import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';

import { Login } from '../../src/pages/Login';
import { loginUser } from '../../src/features/auth/authService';

const { mockNavigate } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
}));

vi.mock('../../src/features/auth/authService', () => ({
    loginUser: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockedLoginUser = vi.mocked(loginUser);

const renderLogin = () => {
    return render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );
};

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe renderizar los campos y el botón de ingreso', () => {
        renderLogin();

        expect(
            screen.getByPlaceholderText('Correo electrónico')
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText('Contraseña')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', { name: 'Entrar' })
        ).toBeInTheDocument();
    });

    it('debe permitir escribir en los campos', async () => {
        const user = userEvent.setup();

        renderLogin();

        const emailInput = screen.getByPlaceholderText('Correo electrónico');
        const passwordInput = screen.getByPlaceholderText('Contraseña');

        await user.type(emailInput, 'test@email.com');
        await user.type(passwordInput, 'password123');

        expect(emailInput).toHaveValue('test@email.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('debe llamar a loginUser con las credenciales ingresadas', async () => {
        const user = userEvent.setup();

        mockedLoginUser.mockResolvedValue(
            {} as Awaited<ReturnType<typeof loginUser>>
        );

        renderLogin();

        await user.type(
            screen.getByPlaceholderText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByPlaceholderText('Contraseña'),
            'password123'
        );

        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(mockedLoginUser).toHaveBeenCalledWith(
                'test@email.com',
                'password123'
            );
        });
    });

    it('debe redirigir al inicio cuando el login es exitoso', async () => {
        const user = userEvent.setup();

        mockedLoginUser.mockResolvedValue(
            {} as Awaited<ReturnType<typeof loginUser>>
        );

        renderLogin();

        await user.type(
            screen.getByPlaceholderText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByPlaceholderText('Contraseña'),
            'password123'
        );

        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('debe mostrar un mensaje si el login falla', async () => {
        const user = userEvent.setup();

        const firebaseError = new FirebaseError(
            'auth/invalid-credential',
            'Invalid credentials'
        );

        mockedLoginUser.mockRejectedValue(firebaseError);

        renderLogin();

        await user.type(
            screen.getByPlaceholderText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByPlaceholderText('Contraseña'),
            'wrongpassword'
        );

        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'El correo o la contraseña son incorrectos.'
        );
    });

    it('debe deshabilitar el botón mientras se procesa el login', async () => {
        const user = userEvent.setup();

        let resolveLogin!: (
            value: Awaited<ReturnType<typeof loginUser>>
        ) => void;

        mockedLoginUser.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveLogin = resolve;
                })
        );

        renderLogin();

        await user.type(
            screen.getByPlaceholderText('Correo electrónico'),
            'test@email.com'
        );

        await user.type(
            screen.getByPlaceholderText('Contraseña'),
            'password123'
        );

        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(
            screen.getByRole('button', { name: 'Ingresando...' })
        ).toBeDisabled();

        resolveLogin({} as Awaited<ReturnType<typeof loginUser>>);
    });
});