import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { PublicRoute } from '../../src/components/PublicRoute';
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

const renderPublicRoute = () => {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <h1>Página pública</h1>
                        </PublicRoute>
                    }
                />

                <Route
                    path="/"
                    element={<h1>Página principal</h1>}
                />
            </Routes>
        </MemoryRouter>
    );
};

describe('PublicRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar un mensaje de carga mientras verifica la sesión', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: true,
        });

        renderPublicRoute();

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.queryByText('Página pública')).not.toBeInTheDocument();
    });

    it('debe permitir el acceso si no hay un usuario autenticado', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: false,
        });

        renderPublicRoute();

        expect(screen.getByText('Página pública')).toBeInTheDocument();
        expect(screen.queryByText('Página principal')).not.toBeInTheDocument();
    });

    it('debe redirigir al inicio si existe un usuario autenticado', () => {
        mockedUseAuth.mockReturnValue({
            currentUser: mockUser,
            loading: false,
        });

        renderPublicRoute();

        expect(screen.getByText('Página principal')).toBeInTheDocument();
        expect(screen.queryByText('Página pública')).not.toBeInTheDocument();
    });
});