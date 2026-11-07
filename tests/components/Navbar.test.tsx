import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { Navbar } from '../../src/components/Navbar';
import { useAuth } from '../../src/features/auth/AuthContext';
import { logoutUser } from '../../src/features/auth/authService';

vi.mock('../../src/features/auth/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../src/features/auth/authService', () => ({
    logoutUser: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedLogoutUser = vi.mocked(logoutUser);

const LocationDisplay = () => {
    const location = useLocation();

    return <span data-testid="current-location">{location.pathname}</span>;
};

const renderNavbar = () => {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Navbar />
            <LocationDisplay />
            <Routes>
                <Route path="/login" element={<p>Página de login</p>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseAuth.mockReturnValue({
            currentUser: {
                uid: 'user-123',
                email: 'test@email.com',
            } as ReturnType<typeof useAuth>['currentUser'],
            loading: false,
        });
    });

    it('debe mostrar un mensaje mientras se verifica la autenticación', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: true,
        });

        renderNavbar();

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe mostrar el email del usuario autenticado', () => {
        renderNavbar();

        expect(screen.getByText('test@email.com')).toBeInTheDocument();
    });

    it('debe mostrar el botón para cerrar sesión cuando hay un usuario autenticado', () => {
        renderNavbar();

        expect(
            screen.getByRole('button', { name: 'Cerrar sesión' })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole('link', { name: 'Iniciar sesión' })
        ).not.toBeInTheDocument();
    });

    it('debe mostrar los enlaces de login y registro cuando no hay sesión', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: false,
        });

        renderNavbar();

        expect(
            screen.getByRole('link', { name: 'Iniciar sesión' })
        ).toHaveAttribute('href', '/login');

        expect(
            screen.getByRole('link', { name: 'Registrarse' })
        ).toHaveAttribute('href', '/register');
    });

    it('debe cerrar sesión y navegar al login correctamente', async () => {
        const user = userEvent.setup();

        mockedLogoutUser.mockResolvedValue(undefined);

        renderNavbar();

        await user.click(
            screen.getByRole('button', { name: 'Cerrar sesión' })
        );

        await waitFor(() => {
            expect(mockedLogoutUser).toHaveBeenCalledOnce();
            expect(screen.getByTestId('current-location')).toHaveTextContent('/login');
        });
    });

    it('debe mostrar un mensaje si ocurre un error al cerrar sesión', async () => {
        const user = userEvent.setup();

        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => { });

        mockedLogoutUser.mockRejectedValue(new Error('Logout failed'));

        renderNavbar();

        await user.click(
            screen.getByRole('button', { name: 'Cerrar sesión' })
        );

        expect(
            screen.getByRole('alert')
        ).toHaveTextContent(
            'No se pudo cerrar la sesión. Intentá nuevamente.'
        );

        expect(screen.getByTestId('current-location')).toHaveTextContent('/');

        consoleError.mockRestore();
    });
});