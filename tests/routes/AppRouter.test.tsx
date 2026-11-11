import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { AppRouter } from '../../src/routes/AppRouter';
import { useAuth } from '../../src/features/auth/AuthContext';

vi.mock('../../src/features/auth/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../src/components/Navbar', () => ({
    Navbar: () => <nav>Navbar</nav>,
}));

vi.mock('../../src/pages/Tasks', () => ({
    Tasks: () => <h1>Página de tareas</h1>,
}));

vi.mock('../../src/pages/Summary', () => ({
    default: () => <h1>Resumen de actividades</h1>,
}));

vi.mock('../../src/pages/Login', () => ({
    Login: () => <h1>Página de login</h1>,
}));

vi.mock('../../src/pages/Register', () => ({
    Register: () => <h1>Página de registro</h1>,
}));

const mockedUseAuth = vi.mocked(useAuth);

describe('AppRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe redirigir al login cuando un usuario no autenticado intenta acceder a tareas', async () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: false,
        });

        render(<AppRouter />);

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Página de login',
                })
            ).toBeInTheDocument();
        });
    });

    it('debe permitir el acceso a tareas cuando el usuario está autenticado', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: {
                uid: 'user-123',
                email: 'test@email.com',
            } as ReturnType<typeof useAuth>['currentUser'],
            loading: false,
        });

        render(<AppRouter />);

        expect(
            screen.getByRole('heading', {
                name: 'Página de tareas',
            })
        ).toBeInTheDocument();
    });

    it('debe mostrar el estado de carga mientras Firebase verifica la sesión', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: true,
        });

        render(<AppRouter />);

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe redirigir al login cuando un usuario no autenticado intenta acceder al resumen', async () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: false,
        });

        window.history.pushState({}, '', '/summary');

        render(<AppRouter />);

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Página de login',
                })
            ).toBeInTheDocument();
        });
    });

    it('debe permitir el acceso al resumen cuando el usuario está autenticado', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: {
                uid: 'user-123',
                email: 'test@email.com',
            } as ReturnType<typeof useAuth>['currentUser'],
            loading: false,
        });

        window.history.pushState({}, '', '/summary');

        render(<AppRouter />);

        expect(
            screen.getByRole('heading', {
                name: 'Resumen de actividades',
            })
        ).toBeInTheDocument();
    });

    it('debe permitir acceder al registro cuando el usuario no está autenticado', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: false,
        });

        window.history.pushState({}, '', '/register');

        render(<AppRouter />);

        expect(
            screen.getByRole('heading', {
                name: 'Página de registro',
            })
        ).toBeInTheDocument();
    });

    it('debe redirigir a tareas cuando un usuario autenticado intenta acceder al login', async () => {
        mockedUseAuth.mockReturnValue({
            currentUser: {
                uid: 'user-123',
                email: 'test@email.com',
            } as ReturnType<typeof useAuth>['currentUser'],
            loading: false,
        });

        window.history.pushState({}, '', '/login');

        render(<AppRouter />);

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Página de tareas',
                })
            ).toBeInTheDocument();
        });
    });
});