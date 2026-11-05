import { FirebaseError } from 'firebase/app';

export const getFirebaseErrorMessage = (error: unknown): string => {
    if (!(error instanceof FirebaseError)) {
        return 'Ocurrió un error inesperado.';
    }

    switch (error.code) {
        case 'auth/invalid-credential':
            return 'El correo o la contraseña son incorrectos.';

        case 'auth/user-disabled':
            return 'Esta cuenta está deshabilitada.';

        case 'auth/too-many-requests':
            return 'Demasiados intentos. Intentá nuevamente más tarde.';

        case 'auth/network-request-failed':
            return 'No se pudo conectar. Revisá tu conexión a internet.';
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya tiene una cuenta.';

        case 'auth/weak-password':
            return 'La contraseña debe tener al menos 6 caracteres.';

        case 'auth/invalid-email':
            return 'Ingresá un correo electrónico válido.';

        default:
            return 'No se pudo completar la operación. Intentá nuevamente.';
    }
}; 
