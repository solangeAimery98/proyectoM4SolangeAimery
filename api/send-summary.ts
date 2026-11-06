import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { adminAuth, adminDb } from './lib/firebaseAdmin';

// Cliente de Amazon SES
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

// Escapar caracteres especiales para evitar inyección HTML
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return entities[character];
  });
}

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

  // 2. Validar configuración de AWS SES
  const senderEmail = process.env.SES_FROM_EMAIL;

  if (!senderEmail) {
    console.error('Falta configurar SES_FROM_EMAIL.');

    return res.status(500).json({
      success: false,
      message: 'La configuración del servicio de correo está incompleta.',
    });
  }

  // 3. Obtener token del encabezado Authorization
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó un token de autenticación.',
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'El token de autenticación está vacío.',
    });
  }

  // 4. Verificar identidad del usuario con Firebase Admin
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

  // 5. Consultar exclusivamente las tareas del usuario autenticado
  try {
    const tasksSnapshot = await adminDb
      .collection('tasks')
      .where('userId', '==', userId)
      .get();

    const tasks = tasksSnapshot.docs.map((document) => document.data());

    const pendingTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    // 6. Construir el resumen del correo
    const taskList = tasks.length
      ? tasks
        .map((task) => {
          const status = task.completed
            ? 'Completada'
            : 'Pendiente';

          const title = escapeHtml(
            String(task.title || 'Sin título')
          );

          const description = task.description
            ? `<p>${escapeHtml(String(task.description))}</p>`
            : '';

          return `
              <li>
                <strong>${title}</strong>
                <span> — ${status}</span>
                ${description}
              </li>
            `;
        })
        .join('')
      : '<li>No tenés tareas registradas.</li>';

    const htmlBody = `
      <h1>Tu resumen de MateCode</h1>

      <p>Hola,</p>

      <p>Este es el resumen actualizado de tus tareas:</p>

      <ul>
        <li><strong>Total de tareas:</strong> ${tasks.length}</li>
        <li><strong>Pendientes:</strong> ${pendingTasks.length}</li>
        <li><strong>Completadas:</strong> ${completedTasks.length}</li>
      </ul>

      <h2>Detalle de tus tareas</h2>

      <ul>${taskList}</ul>

      <p>¡Seguí avanzando con MateCode!</p>
    `;

    const textBody = `
Tu resumen de MateCode

Total de tareas: ${tasks.length}
Pendientes: ${pendingTasks.length}
Completadas: ${completedTasks.length}

Detalle:

${tasks
        .map(
          (task) =>
            `- ${task.title || 'Sin título'}: ${task.completed ? 'Completada' : 'Pendiente'
            }`
        )
        .join('\n')}

¡Seguí avanzando con MateCode!
    `;

    // 7. Enviar correo mediante Amazon SES
    const command = new SendEmailCommand({
      Source: senderEmail,

      Destination: {
        ToAddresses: [email],
      },

      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Tu resumen de tareas de MateCode',
        },

        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlBody,
          },

          Text: {
            Charset: 'UTF-8',
            Data: textBody,
          },
        },
      },
    });

    const emailResult = await sesClient.send(command);

    // 8. Devolver resultado
    return res.status(200).json({
      success: true,
      message: 'Resumen enviado correctamente.',
      user: {
        uid: userId,
        email,
      },
      taskCount: tasks.length,
      pendingCount: pendingTasks.length,
      completedCount: completedTasks.length,
      messageId: emailResult.MessageId,
    });
  } catch (error: unknown) {
    console.error('ERROR GENERANDO O ENVIANDO EL RESUMEN:', error);

    return res.status(500).json({
      success: false,
      message: 'No se pudo generar o enviar el resumen de tareas.',
    });
  }
}