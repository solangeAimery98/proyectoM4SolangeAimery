import {
    describe,
    it,
    expect,
    vi,
    afterEach,
} from 'vitest';

import {
    render,
    screen,
    act,
} from '@testing-library/react';

import { GardenPanel } from '../../src/components/garden/GardenPanel';

import type {
    GardenLevel,
    GardenStage,
} from '../../src/features/garden/types/GardenProgress';

interface GardenTestProps {
    level: GardenLevel;
    stage: GardenStage;
    growthPoints: number;
    totalWaterings: number;
    levelProgress: {
        current: number;
        percentage: number;
        pointsToNextLevel: number;
        isMaxLevel: boolean;
    };
    loading?: boolean;
    error?: string | null;
}

const defaultProps: GardenTestProps = {
    level: 1,
    stage: 'sprout',
    growthPoints: 10,
    totalWaterings: 1,
    levelProgress: {
        current: 10,
        percentage: 20,
        pointsToNextLevel: 40,
        isMaxLevel: false,
    },
};

describe('GardenPanel', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('debe mostrar el título y nivel del jardín', () => {
        render(<GardenPanel {...defaultProps} />);

        expect(
            screen.getByRole('heading', {
                name: 'Mi jardín',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText('Nivel 1')
        ).toBeInTheDocument();
    });

    it('debe mostrar la etapa actual de crecimiento', () => {
        render(<GardenPanel {...defaultProps} />);

        expect(
            screen.getByRole('heading', {
                name: 'Primer brote',
            })
        ).toBeInTheDocument();
    });

    it('debe mostrar los puntos y riegos acumulados', () => {
        render(<GardenPanel {...defaultProps} />);

        expect(
            screen.getByText('10')
        ).toBeInTheDocument();

        expect(
            screen.getByText('1')
        ).toBeInTheDocument();

        expect(
            screen.getByText('Puntos')
        ).toBeInTheDocument();

        expect(
            screen.getByText('Riegos')
        ).toBeInTheDocument();
    });

    it('debe mostrar el porcentaje de progreso', () => {
        render(<GardenPanel {...defaultProps} />);

        expect(
            screen.getByText('20%')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('progressbar')
        ).toHaveAttribute('aria-valuenow', '20');
    });

    it('debe mostrar los puntos necesarios para el siguiente nivel', () => {
        render(<GardenPanel {...defaultProps} />);

        expect(
            screen.getByText(
                'Te faltan 40 puntos para el siguiente nivel.'
            )
        ).toBeInTheDocument();
    });

    it('debe mostrar el estado de carga', () => {
        render(
            <GardenPanel
                {...defaultProps}
                loading={true}
            />
        );

        expect(
            screen.getByRole('status')
        ).toHaveTextContent('Cargando tu jardín...');

        expect(
            screen.queryByText('Primer brote')
        ).not.toBeInTheDocument();
    });

    it('debe mostrar un mensaje cuando ocurre un error', () => {
        render(
            <GardenPanel
                {...defaultProps}
                error="No se pudo cargar el jardín."
            />
        );

        expect(
            screen.getByRole('alert')
        ).toHaveTextContent(
            'No se pudo cargar el jardín.'
        );
    });

    it('debe mostrar un mensaje especial al alcanzar el nivel máximo', () => {
        render(
            <GardenPanel
                {...defaultProps}
                level={5}
                stage="full-bloom"
                growthPoints={350}
                totalWaterings={35}
                levelProgress={{
                    current: 350,
                    percentage: 100,
                    pointsToNextLevel: 0,
                    isMaxLevel: true,
                }}
            />
        );

        expect(
            screen.getByText('Nivel 5')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('heading', {
                name: 'Plena floración',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                '¡Tu planta alcanzó su máximo esplendor!'
            )
        ).toBeInTheDocument();
    });

    it('debe representar correctamente la ilustración de la planta', () => {
        render(<GardenPanel {...defaultProps} />);

        expect(
            screen.getByRole('img', {
                name: 'Ilustración de una planta en nivel 1',
            })
        ).toBeInTheDocument();
    });

    it('no debe activar la animación al cargar el progreso inicial', () => {
        const { container } = render(
            <GardenPanel {...defaultProps} />
        );

        expect(
            container.querySelector('.garden-plant-container')
        ).not.toHaveClass('is-growing');
    });

    it('debe activar la animación cuando recibe puntos nuevos', () => {
        vi.useFakeTimers();

        const { container, rerender } = render(
            <GardenPanel {...defaultProps} />
        );

        rerender(
            <GardenPanel
                {...defaultProps}
                growthPoints={20}
                totalWaterings={2}
                levelProgress={{
                    current: 20,
                    percentage: 40,
                    pointsToNextLevel: 30,
                    isMaxLevel: false,
                }}
            />
        );

        expect(
            container.querySelector('.garden-plant-container')
        ).toHaveClass('is-growing');

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(
            container.querySelector('.garden-plant-container')
        ).not.toHaveClass('is-growing');
    });
});