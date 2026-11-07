import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestSummary } from '../../src/pages/TestSummary';
import { useAuth } from '../../src/features/auth/AuthContext';

vi.mock('../../src/features/auth/AuthContext', () => ({
    useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const mockGetIdToken = vi.fn();

const mockUser = {
    uid: 'user-123',
    email: 'test@email.com',
    getIdToken: mockGetIdToken,
};

describe('TestSummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseAuth.mockReturnValue({
            currentUser: mockUser as unknown as ReturnType<typeof useAuth>['currentUser'],
            loading: false,
        });

        mockGetIdToken.mockResolvedValue('firebase-token-123');

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                json: vi.fn().mockResolvedValue({
                    success: true,
                    taskCount: 5,
                    pendingCount: 3,
                    completedCount: 2,
                    messageId: 'message-123',
                }),
            })
        );
    });

    it('debe mostrar el título y el email del usuario', () => {
        render(<TestSummary />);

        expect(
            screen.getByRole('heading', {
                name: 'Prueba de autenticación del backend',
            })
        ).toBeInTheDocument();

        expect(screen.getByText('Usuario: test@email.com')).toBeInTheDocument();
    });

    it('debe mostrar un mensaje si no hay usuario autenticado', async () => {
        mockedUseAuth.mockReturnValue({
            currentUser: null,
            loading: false,
        });

        const user = userEvent.setup();

        render(<TestSummary />);

        await user.click(
            screen.getByRole('button', { name: 'Probar conexión' })
        );

        expect(
            screen.getByText('No hay un usuario autenticado.')
        ).toBeInTheDocument();

        expect(mockGetIdToken).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('debe obtener el token de Firebase', async () => {
        const user = userEvent.setup();

        render(<TestSummary />);

        await user.click(
            screen.getByRole('button', { name: 'Probar conexión' })
        );

        await waitFor(() => {
            expect(mockGetIdToken).toHaveBeenCalledOnce();
        });
    });

    it('debe enviar el token al backend mediante Bearer', async () => {
        const user = userEvent.setup();

        render(<TestSummary />);

        await user.click(
            screen.getByRole('button', { name: 'Probar conexión' })
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/send-summary', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer firebase-token-123',
                    'Content-Type': 'application/json',
                },
            });
        });
    });

    it('debe mostrar la respuesta exitosa del backend', async () => {
        const user = userEvent.setup();

        render(<TestSummary />);

        await user.click(
            screen.getByRole('button', { name: 'Probar conexión' })
        );

        await waitFor(() => {
            expect(
                screen.getByText(/"success": true/)
            ).toBeInTheDocument();

            expect(
                screen.getByText(/"taskCount": 5/)
            ).toBeInTheDocument();
        });
    });

    it('debe mostrar un mensaje si falla la comunicación con el servidor', async () => {
        const user = userEvent.setup();

        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => { });

        vi.mocked(fetch).mockRejectedValue(
            new Error('Network error')
        );

        render(<TestSummary />);

        await user.click(
            screen.getByRole('button', { name: 'Probar conexión' })
        );

        await waitFor(() => {
            expect(
                screen.getByText('Error al comunicarse con el servidor.')
            ).toBeInTheDocument();
        });

        consoleError.mockRestore();
    });

    it('debe desactivar el botón durante la solicitud y habilitarlo al terminar', async () => {
        const user = userEvent.setup();

        let resolveResponse!: (value: Response) => void;

        vi.mocked(fetch).mockReturnValue(
            new Promise((resolve) => {
                resolveResponse = resolve;
            })
        );

        render(<TestSummary />);

        await user.click(
            screen.getByRole('button', { name: 'Probar conexión' })
        );

        expect(
            screen.getByRole('button', { name: 'Verificando...' })
        ).toBeDisabled();

        resolveResponse({
            json: async () => ({ success: true }),
        } as Response);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Probar conexión' })
            ).toBeEnabled();
        });
    });
});