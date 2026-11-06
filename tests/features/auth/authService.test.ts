import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth';

import { auth } from '../../../src/services/firebase/config';

import {
    loginUser,
    registerUser,
    logoutUser,
} from '../../../src/features/auth/authService';

vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
}));

vi.mock('../../../src/services/firebase/config', () => ({
    auth: {},
}));

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe iniciar sesión con email y contraseña', async () => {
        const mockResponse = { user: { uid: 'user-1' } };

        vi.mocked(signInWithEmailAndPassword).mockResolvedValue(
            mockResponse as never
        );

        const result = await loginUser('test@email.com', 'password123');

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            auth,
            'test@email.com',
            'password123'
        );

        expect(result).toBe(mockResponse);
    });

    it('debe propagar errores al iniciar sesión', async () => {
        vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
            new Error('Login failed')
        );

        await expect(
            loginUser('test@email.com', 'wrong-password')
        ).rejects.toThrow('Login failed');
    });

    it('debe registrar un usuario con email y contraseña', async () => {
        const mockResponse = { user: { uid: 'user-2' } };

        vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(
            mockResponse as never
        );

        const result = await registerUser('new@email.com', 'password123');

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
            auth,
            'new@email.com',
            'password123'
        );

        expect(result).toBe(mockResponse);
    });

    it('debe propagar errores al registrar un usuario', async () => {
        vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
            new Error('Registration failed')
        );

        await expect(
            registerUser('existing@email.com', 'password123')
        ).rejects.toThrow('Registration failed');
    });

    it('debe cerrar la sesión del usuario', async () => {
        vi.mocked(signOut).mockResolvedValue(undefined);

        await logoutUser();

        expect(signOut).toHaveBeenCalledWith(auth);
    });

    it('debe propagar errores al cerrar sesión', async () => {
        vi.mocked(signOut).mockRejectedValue(
            new Error('Logout failed')
        );

        await expect(logoutUser()).rejects.toThrow('Logout failed');
    });
}); 