import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { useAuth } from '../../src/features/auth/AuthContext';
import type { User as FirebaseUser } from 'firebase/auth';

vi.mock('../../src/features/auth/AuthContext', () => ({
    useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const mockUser = {
    uid: 'user-123',
    email: 'test@email.com',
} as FirebaseUser;

const renderProtectedRoute = () => {
    return render(
        <MemoryRouter initialEntries={['/private']}>
            <Routes>
                <Route
                    path="/private"
                    element={
                        <ProtectedRoute>
                            <h1>Contenido protegido</h1>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/login"
                    element={<h1>Página de login</h1>}
                />
            </Routes>
        </MemoryRouter>
    );
};

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar un mensaje de carga mientras verifica la sesión', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: true,
        });

        renderProtectedRoute();

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
    });

    it('debe redirigir al login si no hay un usuario autenticado', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: false,
        });

        renderProtectedRoute();

        expect(screen.getByText('Página de login')).toBeInTheDocument();
        expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
    });

    it('debe permitir el acceso si existe un usuario autenticado', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: mockUser,
            loading: false,
        });

        renderProtectedRoute();

        expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
        expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
    });
});