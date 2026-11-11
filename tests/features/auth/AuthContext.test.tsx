import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from '../../../src/features/auth/AuthContext';

import { onAuthStateChanged } from 'firebase/auth';

import type { User as FirebaseUser } from 'firebase/auth';

// Simulamos Firebase Auth.
const authMocks = vi.hoisted(() => ({
    onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
    onAuthStateChanged: authMocks.onAuthStateChanged,
}));

vi.mock('../../../src/services/firebase/config', () => ({
    auth: {},
}));

const mockedOnAuthStateChanged = vi.mocked(onAuthStateChanged);

const createWrapper = () => {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    return Wrapper;
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedOnAuthStateChanged.mockReturnValue(vi.fn());
    });

    it('debe comenzar con loading en true', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        expect(result.current.loading).toBe(true);
    });

    it('debe comenzar sin un usuario autenticado', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        expect(result.current.currentUser).toBeNull();
    });

    it('debe actualizar currentUser cuando Firebase detecta un usuario', async () => {
        const mockUser = {
            uid: 'user-1',
            email: 'test@email.com',
        } as FirebaseUser;

        mockedOnAuthStateChanged.mockImplementation(
            (_auth, callback) => {
                callback(mockUser);
                return vi.fn();
            }
        );

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.currentUser).toBe(mockUser);
            expect(result.current.loading).toBe(false);
        });
    });

    it('debe actualizar currentUser a null cuando no hay sesión', async () => {
        mockedOnAuthStateChanged.mockImplementation(
            (_auth, callback) => {
                callback(null);
                return vi.fn();
            }
        );

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.currentUser).toBeNull();
            expect(result.current.loading).toBe(false);
        });
    });

    it('debe actualizar la sesión cuando Firebase detecta un cambio de usuario', async () => {
        const mockUser = {
            uid: 'user-1',
            email: 'test@email.com',
        } as FirebaseUser;

        let authCallback: ((user: FirebaseUser | null) => void) | undefined;

        mockedOnAuthStateChanged.mockImplementation(
            (_auth, callback) => {
                authCallback = callback;
                return vi.fn();
            }
        );

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        // Firebase detecta un usuario autenticado.
        await act(async () => {
            authCallback?.(mockUser);
        });

        expect(result.current.currentUser).toBe(mockUser);
        expect(result.current.loading).toBe(false);

        // Firebase detecta que el usuario cerró sesión.
        await act(async () => {
            authCallback?.(null);
        });

        expect(result.current.currentUser).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('debe suscribirse a los cambios de autenticación', () => {
        renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        expect(mockedOnAuthStateChanged).toHaveBeenCalledOnce();
    });

    it('debe cancelar la suscripción al desmontar AuthProvider', () => {
        const unsubscribe = vi.fn();

        mockedOnAuthStateChanged.mockReturnValue(unsubscribe);

        const { unmount } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        unmount();

        expect(unsubscribe).toHaveBeenCalledOnce();
    });

    it('debe lanzar un error si useAuth se utiliza fuera de AuthProvider', () => {
        expect(() => renderHook(() => useAuth())).toThrow(
            'useAuth debe utilizarse dentro de un AuthProvider'
        );
    });
});