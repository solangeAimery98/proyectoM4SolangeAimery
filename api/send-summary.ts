import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth, adminDb } from './lib/firebaseAdmin';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1. Verificar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido.',
    });
  }

  // 2. Obtener token del encabezado Authorization
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó un token de autenticación.',
    });
  }

  const token = authorization.split(' ')[1];

  // 3. Verificar identidad del usuario con Firebase Admin
  let decodedToken;

  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error: unknown) {
    console.error('ERROR VERIFICANDO TOKEN:', error);

    return res.status(401).json({
      success: false,
      message: 'Falló la verificación del token.',
    });
  }

  const userId = decodedToken.uid;
  const email = decodedToken.email;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'El usuario no tiene un correo electrónico asociado.',
    });
  }

  // 4. Consultar exclusivamente las tareas del usuario autenticado
  try {
    const tasksSnapshot = await adminDb
      .collection('tasks')
      .where('userId', '==', userId)
      .get();

    return res.status(200).json({
      success: true,
      message: 'Usuario autenticado correctamente.',
      user: {
        uid: userId,
        email,
      },
      taskCount: tasksSnapshot.size,
    });
  } catch (error: unknown) {
    console.error('ERROR CONSULTANDO FIRESTORE:', error);

    return res.status(500).json({
      success: false,
      message: 'Falló la consulta a Firestore.',
    });
  }
}