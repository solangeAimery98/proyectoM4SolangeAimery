import {
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    vi,
} from 'vitest';

import {
    render,
    screen,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import Summary from '../../src/pages/Summary';

import { useAuth } from '../../src/features/auth/AuthContext';
import { useTasks } from '../../src/features/tasks/useTasks';
import { useGardenProgress } from '../../src/features/garden/hooks/useGardenProgress';

import type { Task } from '../../src/types/Task';

const mocks = vi.hoisted(() => ({
    getIdToken: vi.fn(),
}));

vi.mock('../../src/features/auth/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../src/features/tasks/useTasks', () => ({
    useTasks: vi.fn(),
}));

vi.mock('../../src/features/garden/hooks/useGardenProgress', () => ({
    useGardenProgress: vi.fn(),
}));

vi.mock('../../src/components/dashboard/DashboardSummary', () => ({
    DashboardSummary: ({
        total,
        pending,
        completed,
        percentage,
    }: {
        total: number;
        pending: number;
        completed: number;
        percentage: number;
    }) => (
        <div data-testid="dashboard-summary">
            <span>Total: {total}</span>
            <span>Pendientes: {pending}</span>
            <span>Completadas: {completed}</span>
            <span>Porcentaje: {percentage}%</span>
        </div>
    ),
}));

vi.mock('../../src/components/garden/GardenPanel', () => ({
    GardenPanel: () => (
        <div data-testid="garden-panel">
            Jardín
        </div>
    ),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseTasks = vi.mocked(useTasks);
const mockedUseGardenProgress = vi.mocked(useGardenProgress);

const mockTasks: Task[] = [
    {
        id: 'task-1',
        title: 'Estudiar React',
        description: 'Repasar componentes',
        completed: true,
        createdAt: null,
        userId: 'user-123',
    },
    {
        id: 'task-2',
        title: 'Practicar TypeScript',
        description: 'Repasar tipos',
        completed: false,
        createdAt: null,
        userId: 'user-123',
    },
    {
        id: 'task-3',
        title: 'Estudiar Firebase',
        description: 'Repasar Firestore',
        completed: true,
        createdAt: null,
        userId: 'user-123',
    },
];

const configureTasks = (overrides = {}) => {
    mockedUseTasks.mockReturnValue({
        tasks: mockTasks,
        loading: false,
        error: null,
        addTask: vi.fn(),
        toggleTask: vi.fn(),
        editTask: vi.fn(),
        deleteTask: vi.fn(),
        ...overrides,
    } as ReturnType<typeof useTasks>);
};

const configureGarden = (overrides = {}) => {
    mockedUseGardenProgress.mockReturnValue({
        progress: {
            growthPoints: 130,
            totalWaterings: 13,
            lastRewardTaskId: 'task-1',
            updatedAt: null,
        },
        level: 3,
        stage: 'growth',
        levelProgress: {
            current: 130,
            percentage: 30,
            pointsToNextLevel: 70,
            isMaxLevel: false,
        },
        loading: false,
        error: null,
        ...overrides,
    } as ReturnType<typeof useGardenProgress>);
};

describe('Summary', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseAuth.mockReturnValue({
            currentUser: {
                uid: 'user-123',
                email: 'test@email.com',
                displayName: 'Sol',
                getIdToken: mocks.getIdToken,
            } as unknown as ReturnType<typeof useAuth>['currentUser'],
            loading: false,
        });

        mocks.getIdToken.mockResolvedValue('fake-auth-token');

        configureTasks();
        configureGarden();

        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('debe mostrar las estadísticas calculadas correctamente', () => {
        render(<Summary />);

        expect(
            screen.getByRole('heading', {
                name: 'Tu progreso, Sol',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByTestId('dashboard-summary')
        ).toHaveTextContent('Total: 3');

        expect(
            screen.getByTestId('dashboard-summary')
        ).toHaveTextContent('Pendientes: 1');

        expect(
            screen.getByTestId('dashboard-summary')
        ).toHaveTextContent('Completadas: 2');

        expect(
            screen.getByTestId('dashboard-summary')
        ).toHaveTextContent('Porcentaje: 67%');
    });

    it('debe mostrar un mensaje mientras se cargan las tareas', () => {
        configureTasks({
            loading: true,
        });

        render(<Summary />);

        expect(
            screen.getByRole('status')
        ).toHaveTextContent('Preparando tu resumen...');

        expect(
            screen.queryByRole('button', {
                name: 'Enviar mi resumen',
            })
        ).not.toBeInTheDocument();
    });

    it('debe mostrar un mensaje cuando ocurre un error al cargar las tareas', () => {
        configureTasks({
            error: 'No se pudieron cargar las tareas.',
        });

        render(<Summary />);

        expect(
            screen.getByRole('alert')
        ).toHaveTextContent(
            'No pudimos cargar tus estadísticas. Intentá nuevamente.'
        );

        expect(
            screen.queryByRole('button', {
                name: 'Enviar mi resumen',
            })
        ).not.toBeInTheDocument();
    });

    it('debe enviar el resumen y mostrar una confirmación cuando el envío es exitoso', async () => {
        const user = userEvent.setup();

        const fetchMock = vi.mocked(fetch);

        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                message: 'Resumen enviado correctamente.',
            }),
        } as Response);

        render(<Summary />);

        await user.click(
            screen.getByRole('button', {
                name: 'Enviar mi resumen',
            })
        );

        expect(mocks.getIdToken).toHaveBeenCalledTimes(1);

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/send-summary',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer fake-auth-token',
                    'Content-Type': 'application/json',
                },
            }
        );

        expect(
            await screen.findByRole('status')
        ).toHaveTextContent(
            '¡Tu resumen fue enviado correctamente a test@email.com!'
        );
    });

    it('debe mostrar un mensaje cuando falla el envío del resumen', async () => {
        const user = userEvent.setup();

        const fetchMock = vi.mocked(fetch);

        fetchMock.mockResolvedValue({
            ok: false,
            json: async () => ({
                success: false,
                message: 'No se pudo enviar el resumen.',
            }),
        } as Response);

        render(<Summary />);

        await user.click(
            screen.getByRole('button', {
                name: 'Enviar mi resumen',
            })
        );

        expect(
            await screen.findByRole('alert')
        ).toHaveTextContent(
            'No se pudo enviar el resumen.'
        );

        expect(
            screen.getByRole('button', {
                name: 'Enviar mi resumen',
            })
        ).toBeEnabled();
    });

    it('debe permitir reintentar el envío después de un error', async () => {
        const user = userEvent.setup();

        const fetchMock = vi.mocked(fetch);

        fetchMock
            .mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    success: false,
                    message: 'Error temporal del servidor.',
                }),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Resumen enviado correctamente.',
                }),
            } as Response);

        render(<Summary />);

        const sendButton = screen.getByRole('button', {
            name: 'Enviar mi resumen',
        });

        await user.click(sendButton);

        expect(
            await screen.findByRole('alert')
        ).toHaveTextContent('Error temporal del servidor.');

        await user.click(sendButton);

        expect(
            await screen.findByRole('status')
        ).toHaveTextContent(
            '¡Tu resumen fue enviado correctamente a test@email.com!'
        );

        expect(fetchMock).toHaveBeenCalledTimes(2);

        expect(mocks.getIdToken).toHaveBeenCalledTimes(2);
    });
});