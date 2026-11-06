import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mocks disponibles antes de cargar los módulos
const mocks = vi.hoisted(() => ({
    verifyIdToken: vi.fn(),
    collection: vi.fn(),
    where: vi.fn(),
    get: vi.fn(),
    send: vi.fn(),
    sendEmailCommand: vi.fn(),
}));

vi.mock('../../api/lib/firebaseAdmin', () => ({
    adminAuth: {
        verifyIdToken: mocks.verifyIdToken,
    },
    adminDb: {
        collection: mocks.collection,
    },
}));

vi.mock('@aws-sdk/client-ses', () => ({
    SESClient: class {
        send = mocks.send;
    },
    SendEmailCommand: class {
        input: unknown;

        constructor(input: unknown) {
            this.input = input;
            mocks.sendEmailCommand(input);
        }
    },
}));

import handler from '../../api/send-summary';

type MockResponse = VercelResponse & {
    statusCode: number;
    body: unknown;
};

const createResponse = (): MockResponse => {
    const response = {
        statusCode: 200,
        body: null as unknown,

        status(code: number) {
            this.statusCode = code;
            return this;
        },

        json(data: unknown) {
            this.body = data;
            return this;
        },
    };

    return response as MockResponse;
};

const createRequest = (
    method = 'POST',
    authorization?: string
): VercelRequest => {
    return {
        method,
        headers: {
            authorization,
        },
    } as VercelRequest;
};

const mockTasks = [
    {
        title: 'Estudiar React',
        description: 'Repasar componentes',
        completed: false,
    },
    {
        title: 'Practicar TypeScript',
        description: 'Resolver ejercicios',
        completed: true,
    },
    {
        title: 'Preparar proyecto',
        description: '',
        completed: false,
    },
];

const configureFirestore = (tasks = mockTasks) => {
    mocks.get.mockResolvedValue({
        docs: tasks.map((task) => ({
            data: () => task,
        })),
    });

    mocks.where.mockReturnValue({
        get: mocks.get,
    });

    mocks.collection.mockReturnValue({
        where: mocks.where,
    });
};

describe('send-summary API', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.stubEnv('SES_FROM_EMAIL', 'sender@test.com');
        vi.stubEnv('AWS_REGION', 'us-east-2');

        mocks.verifyIdToken.mockResolvedValue({
            uid: 'user-123',
            email: 'user@test.com',
        });

        mocks.send.mockResolvedValue({
            MessageId: 'message-123',
        });

        configureFirestore();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('debe rechazar métodos distintos de POST', async () => {
        const req = createRequest('GET');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(405);
        expect(res.body).toEqual({
            success: false,
            message: 'Método no permitido.',
        });

        expect(mocks.verifyIdToken).not.toHaveBeenCalled();
    });

    it('debe rechazar solicitudes sin token', async () => {
        const req = createRequest('POST');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: 'No se proporcionó un token de autenticación.',
        });
    });

    it('debe rechazar un token vacío', async () => {
        const req = createRequest('POST', 'Bearer ');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: 'El token de autenticación está vacío.',
        });
    });

    it('debe rechazar tokens inválidos', async () => {
        mocks.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

        const req = createRequest('POST', 'Bearer invalid-token');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: 'Falló la verificación del token.',
        });
    });

    it('debe rechazar usuarios sin email asociado', async () => {
        mocks.verifyIdToken.mockResolvedValue({
            uid: 'user-123',
        });

        const req = createRequest('POST', 'Bearer valid-token');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            success: false,
            message: 'El usuario no tiene un correo electrónico asociado.',
        });
    });

    it('debe rechazar solicitudes si falta la configuración de SES', async () => {
        vi.stubEnv('SES_FROM_EMAIL', '');

        const req = createRequest('POST', 'Bearer valid-token');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'La configuración del servicio de correo está incompleta.',
        });

        expect(mocks.verifyIdToken).not.toHaveBeenCalled();
    });

    it('debe generar y enviar correctamente el resumen de tareas', async () => {
        const req = createRequest('POST', 'Bearer valid-token');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(200);

        expect(res.body).toEqual({
            success: true,
            message: 'Resumen enviado correctamente.',
            user: {
                uid: 'user-123',
                email: 'user@test.com',
            },
            taskCount: 3,
            pendingCount: 2,
            completedCount: 1,
            messageId: 'message-123',
        });

        expect(mocks.verifyIdToken).toHaveBeenCalledWith('valid-token');

        expect(mocks.collection).toHaveBeenCalledWith('tasks');

        expect(mocks.where).toHaveBeenCalledWith(
            'userId',
            '==',
            'user-123'
        );

        expect(mocks.send).toHaveBeenCalledOnce();
    });

    it('debe enviar un resumen cuando el usuario no tiene tareas', async () => {
        configureFirestore([]);

        const req = createRequest('POST', 'Bearer valid-token');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(200);

        expect(res.body).toMatchObject({
            success: true,
            taskCount: 0,
            pendingCount: 0,
            completedCount: 0,
        });

        const emailInput = mocks.sendEmailCommand.mock.calls[0][0];

        expect(emailInput.Message.Body.Html.Data).toContain(
            'No tenés tareas registradas.'
        );
    });

    it('debe enviar el correo al email obtenido del token y no al enviado por el cliente', async () => {
        const req = {
            ...createRequest('POST', 'Bearer valid-token'),
            body: {
                email: 'attacker@test.com',
            },
        } as VercelRequest;

        const res = createResponse();

        await handler(req, res);

        const emailInput = mocks.sendEmailCommand.mock.calls[0][0];

        expect(emailInput.Destination.ToAddresses).toEqual([
            'user@test.com',
        ]);

        expect(emailInput.Destination.ToAddresses).not.toContain(
            'attacker@test.com'
        );
    });

    it('debe escapar caracteres especiales en el contenido HTML', async () => {
        configureFirestore([
            {
                title: '<script>alert("XSS")</script>',
                description: '<img src=x onerror=alert(1)>',
                completed: false,
            },
        ]);

        const req = createRequest('POST', 'Bearer valid-token');
        const res = createResponse();

        await handler(req, res);

        const emailInput = mocks.sendEmailCommand.mock.calls[0][0];
        const htmlBody = emailInput.Message.Body.Html.Data;

        expect(htmlBody).toContain('&lt;script&gt;');
        expect(htmlBody).toContain('&lt;img src=x onerror=alert(1)&gt;');

        expect(htmlBody).not.toContain('<script>');
        expect(htmlBody).not.toContain('<img src=x');
    });

    it('debe manejar errores al consultar Firestore', async () => {
        mocks.get.mockRejectedValue(new Error('Firestore unavailable'));

        const req = createRequest('POST', 'Bearer valid-token');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'No se pudo generar o enviar el resumen de tareas.',
        });

        expect(mocks.send).not.toHaveBeenCalled();
    });

    it('debe manejar errores al enviar el correo mediante SES', async () => {
        mocks.send.mockRejectedValue(new Error('SES unavailable'));

        const req = createRequest('POST', 'Bearer valid-token');
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'No se pudo generar o enviar el resumen de tareas.',
        });
    });
});