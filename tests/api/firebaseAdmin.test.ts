import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getApps: vi.fn(),
    getApp: vi.fn(),
    initializeApp: vi.fn(),
    cert: vi.fn(),
    getAuth: vi.fn(),
    getFirestore: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
    getApps: mocks.getApps,
    getApp: mocks.getApp,
    initializeApp: mocks.initializeApp,
    cert: mocks.cert,
}));

vi.mock('firebase-admin/auth', () => ({
    getAuth: mocks.getAuth,
}));

vi.mock('firebase-admin/firestore', () => ({
    getFirestore: mocks.getFirestore,
}));

describe('firebaseAdmin', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();

        process.env.FIREBASE_PROJECT_ID = 'test-project';
        process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
        process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';

        mocks.getApps.mockReturnValue([]);
        mocks.initializeApp.mockReturnValue({ name: 'test-app' });
        mocks.cert.mockReturnValue({ credential: 'test-credential' });
        mocks.getAuth.mockReturnValue({ name: 'test-auth' });
        mocks.getFirestore.mockReturnValue({ name: 'test-firestore' });
    });

    it('debe inicializar Firebase cuando no existe una instancia previa', async () => {
        await import('../../api/lib/firebaseAdmin');

        expect(mocks.getApps).toHaveBeenCalledOnce();
        expect(mocks.initializeApp).toHaveBeenCalledOnce();
        expect(mocks.getApp).not.toHaveBeenCalled();
    });

    it('debe utilizar las credenciales de las variables de entorno', async () => {
        await import('../../api/lib/firebaseAdmin');

        expect(mocks.cert).toHaveBeenCalledWith({
            projectId: 'test-project',
            clientEmail: 'test@test-project.iam.gserviceaccount.com',
            privateKey: 'test-private-key',
        });
    });

    it('debe convertir los saltos de línea escapados de la clave privada', async () => {
        process.env.FIREBASE_PRIVATE_KEY = 'linea1\\nlinea2';

        await import('../../api/lib/firebaseAdmin');

        expect(mocks.cert).toHaveBeenCalledWith({
            projectId: 'test-project',
            clientEmail: 'test@test-project.iam.gserviceaccount.com',
            privateKey: 'linea1\nlinea2',
        });
    });

    it('debe reutilizar una instancia existente de Firebase', async () => {
        mocks.getApps.mockReturnValue([{ name: 'existing-app' }]);
        mocks.getApp.mockReturnValue({ name: 'existing-app' });

        await import('../../api/lib/firebaseAdmin');

        expect(mocks.getApp).toHaveBeenCalledOnce();
        expect(mocks.initializeApp).not.toHaveBeenCalled();
        expect(mocks.cert).not.toHaveBeenCalled();
    });

    it('debe exportar correctamente Firebase Auth y Firestore', async () => {
        const firebaseAdmin = await import('../../api/lib/firebaseAdmin');

        expect(mocks.getAuth).toHaveBeenCalledWith({
            name: 'test-app',
        });

        expect(mocks.getFirestore).toHaveBeenCalledWith({
            name: 'test-app',
        });

        expect(firebaseAdmin.adminAuth).toEqual({
            name: 'test-auth',
        });

        expect(firebaseAdmin.adminDb).toEqual({
            name: 'test-firestore',
        });
    });

    it('debe lanzar un error cuando faltan variables de entorno', async () => {
        delete process.env.FIREBASE_PROJECT_ID;

        await expect(
            import('../../api/lib/firebaseAdmin')
        ).rejects.toThrow(
            'Faltan variables de entorno de Firebase Admin.'
        );

        expect(mocks.initializeApp).not.toHaveBeenCalled();
    });
});