import {
    initializeApp,
    getApps,
    getApp,
    cert,
} from 'firebase-admin/app';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Obtener las credenciales desde las variables de entorno
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Faltan variables de entorno de Firebase Admin.');
}

// Evitar inicializar Firebase más de una vez
const firebaseAdminApp =
    getApps().length > 0
        ? getApp()
        : initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });

// Exportar los servicios administrativos
export const adminAuth = getAuth(firebaseAdminApp);
export const adminDb = getFirestore(firebaseAdminApp);