import { describe, expect, it } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { getFirebaseErrorMessage } from '../../src/utils/firebaseErrors';

describe('getFirebaseErrorMessage', () => {
    it.each([
        [
            'auth/invalid-credential',
            'El correo o la contraseña son incorrectos.',
        ],
        [
            'auth/user-disabled',
            'Esta cuenta está deshabilitada.',
        ],
        [
            'auth/too-many-requests',
            'Demasiados intentos. Intentá nuevamente más tarde.',
        ],
        [
            'auth/network-request-failed',
            'No se pudo conectar. Revisá tu conexión a internet.',
        ],
        [
            'auth/email-already-in-use',
            'Este correo electrónico ya tiene una cuenta.',
        ],
        [
            'auth/weak-password',
            'La contraseña debe tener al menos 6 caracteres.',
        ],
        [
            'auth/invalid-email',
            'Ingresá un correo electrónico válido.',
        ],
    ])('debe traducir el error %s al mensaje correspondiente', (code, expectedMessage) => {
        const error = new FirebaseError(code, 'Firebase test error');

        expect(getFirebaseErrorMessage(error)).toBe(expectedMessage);
    });

    it('debe devolver un mensaje genérico para un código de Firebase no contemplado', () => {
        const error = new FirebaseError(
            'auth/unknown-error',
            'Unknown Firebase error'
        );

        expect(getFirebaseErrorMessage(error)).toBe(
            'No se pudo completar la operación. Intentá nuevamente.'
        );
    });

    it('debe devolver un mensaje genérico si el error no es de Firebase', () => {
        const error = new Error('Unexpected error');

        expect(getFirebaseErrorMessage(error)).toBe(
            'Ocurrió un error inesperado.'
        );
    });
});