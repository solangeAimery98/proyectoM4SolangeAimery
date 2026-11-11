import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { adminAuth, adminDb } from './lib/firebaseAdmin';

import {
  getGardenLevel,
  getGardenStage,
  getLevelProgress,
} from '../src/features/garden/services/gardenProgression';

// ==========================================
// CONFIGURACIÓN
// ==========================================

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const TIME_ZONE = 'America/Argentina/Buenos_Aires';

// ==========================================
// UTILIDADES
// ==========================================

// Escapa caracteres especiales para evitar inyección HTML.
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

// Obtiene la fecha local de Argentina en formato YYYY-MM-DD.
function getLocalDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

// Genera las fechas de los últimos siete días, incluyendo hoy.
function getLastSevenDays() {
  const today = getLocalDateKey(new Date());

  const [year, month, day] = today.split('-').map(Number);

  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - (6 - index)));

    const dateKey = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0'),
    ].join('-');

    return dateKey;
  });

  return dates;
}

// ==========================================
// ENDPOINT
// ==========================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1. Verificar método HTTP.
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido.',
    });
  }

  // 2. Validar configuración de AWS SES.
  const senderEmail = process.env.SES_FROM_EMAIL;

  if (!senderEmail) {
    console.error('Falta configurar SES_FROM_EMAIL.');

    return res.status(500).json({
      success: false,
      message: 'La configuración del servicio de correo está incompleta.',
    });
  }

  // 3. Obtener token del encabezado Authorization.
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

  // 4. Verificar identidad del usuario con Firebase Admin.
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

  // 5. Consultar los datos del usuario.
  try {
    const [tasksSnapshot, gardenSnapshot] = await Promise.all([
      adminDb
        .collection('tasks')
        .where('userId', '==', userId)
        .get(),

      adminDb
        .collection('users')
        .doc(userId)
        .collection('garden')
        .doc('progress')
        .get(),
    ]);

    // ==========================================
    // DATOS DE TAREAS
    // ==========================================

    const tasks = tasksSnapshot.docs.map((document) => document.data());

    const pendingTasks = tasks.filter((task) => !task.completed);

    const completedTasks = tasks.filter((task) => task.completed);

    const totalTasks = tasks.length;

    const completionPercentage =
      totalTasks > 0
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0;

    // ==========================================
    // DATOS DEL JARDÍN
    // ==========================================

    const gardenData = gardenSnapshot.exists
      ? gardenSnapshot.data()
      : null;

    const growthPoints =
      typeof gardenData?.growthPoints === 'number'
        ? gardenData.growthPoints
        : 0;

    const totalWaterings =
      typeof gardenData?.totalWaterings === 'number'
        ? gardenData.totalWaterings
        : 0;

    const gardenLevel = getGardenLevel(growthPoints);

    const gardenStage = getGardenStage(gardenLevel);

    const levelProgress = getLevelProgress(growthPoints);

    const gardenStageNames: Record<string, string> = {
      sprout: 'Brote',
      'first-leaves': 'Primeras hojas',
      growth: 'Crecimiento',
      flowering: 'Floración',
      'full-bloom': 'Plena floración',
    };

    const gardenStageName = gardenStageNames[gardenStage];

    // ==========================================
    // ACTIVIDAD DE LOS ÚLTIMOS SIETE DÍAS
    // ==========================================

    const lastSevenDays = getLastSevenDays();

    const weeklyActivity = lastSevenDays.map((dateKey) => {
      const [year, month, day] = dateKey.split('-').map(Number);

      const date = new Date(Date.UTC(year, month - 1, day));

      const dayName = new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        timeZone: 'UTC',
      }).format(date);

      const completedCount = completedTasks.filter((task) => {
        if (!task.completedAt || typeof task.completedAt.toDate !== 'function') {
          return false;
        }

        const completedDate = task.completedAt.toDate();

        return getLocalDateKey(completedDate) === dateKey;
      }).length;

      return {
        date: dateKey,
        day: dayName,
        completedCount,
      };
    });

    const weeklyCompletedTasks = weeklyActivity.reduce(
      (total, day) => total + day.completedCount,
      0
    );

    // ==========================================
    // LISTADO DE TAREAS PENDIENTES
    // ==========================================

    const pendingTasksHtml = pendingTasks.length
      ? pendingTasks
        .map((task) => {
          const title = escapeHtml(
            String(task.title || 'Sin título')
          );

          const description = task.description
            ? `<p>${escapeHtml(String(task.description))}</p>`
            : '';

          return `
              <li>
                <strong>${title}</strong>
                ${description}
              </li>
            `;
        })
        .join('')
      : '<li>¡No tenés tareas pendientes!</li>';

    const pendingTasksText = pendingTasks.length
      ? pendingTasks
        .map((task) => {
          const title = String(task.title || 'Sin título');

          return `- ${title}`;
        })
        .join('\n')
      : '¡No tenés tareas pendientes!';

    // ==========================================
    // ACTIVIDAD SEMANAL HTML
    // ==========================================

    const weeklyActivityHtml = weeklyActivity
      .map(
        (day) => `
          <li>
            <strong>${escapeHtml(day.day)}:</strong>
            ${day.completedCount} ${day.completedCount === 1 ? 'tarea completada' : 'tareas completadas'
          }
          </li>
        `
      )
      .join('');

    // ==========================================
    // ACTIVIDAD SEMANAL TEXTO
    // ==========================================

    const weeklyActivityText = weeklyActivity
      .map(
        (day) =>
          `- ${day.day}: ${day.completedCount} ${day.completedCount === 1 ? 'tarea completada' : 'tareas completadas'
          }`
      )
      .join('\n');

    // ==========================================
    // CONSTRUIR CORREO HTML
    // ==========================================

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>

        <body style="
          margin: 0;
          padding: 30px 15px;
          background-color: #faf7f5;
          font-family: Arial, sans-serif;
          color: #443b3e;
        ">

          <div style="
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 16px;
          ">

            <h1 style="
              color: #91445F;
              text-align: center;
              margin-bottom: 8px;
            ">
              Bloomy
            </h1>

            <p style="
              text-align: center;
              color: #8b7b81;
              margin-top: 0;
            ">
              Make your days bloom.
            </p>

            <hr style="
              border: none;
              border-top: 1px solid #eee5e8;
              margin: 25px 0;
            ">

            <h2 style="color: #91445F;">
              Tu resumen de actividades
            </h2>

            <p>¡Hola!</p>

            <p>
              Este es un resumen de tu progreso y de todo lo que
              estás haciendo crecer en Bloomy.
            </p>

            <h3 style="color: #91445F;">
              Tus tareas
            </h3>

            <ul>
              <li><strong>Total:</strong> ${totalTasks}</li>
              <li><strong>Completadas:</strong> ${completedTasks.length}</li>
              <li><strong>Pendientes:</strong> ${pendingTasks.length}</li>
              <li><strong>Progreso:</strong> ${completionPercentage}%</li>
            </ul>

            <h3 style="color: #91445F;">
              Tu jardín
            </h3>

            <ul>
              <li><strong>Nivel:</strong> ${gardenLevel}</li>
              <li><strong>Etapa:</strong> ${gardenStageName}</li>
              <li><strong>Puntos acumulados:</strong> ${growthPoints}</li>
              <li><strong>Riegos realizados:</strong> ${totalWaterings}</li>
              <li><strong>Progreso del nivel:</strong> ${levelProgress.percentage}%</li>
              <li>
                <strong>Próximo nivel:</strong>
                ${levelProgress.isMaxLevel
        ? '¡Alcanzaste el nivel máximo!'
        : `${levelProgress.pointsToNextLevel} puntos restantes`
      }
              </li>
            </ul>

            <h3 style="color: #91445F;">
              Tu actividad semanal
            </h3>

            <p>
              Completaste ${weeklyCompletedTasks} ${weeklyCompletedTasks === 1 ? 'tarea' : 'tareas'
      } durante los últimos siete días.
            </p>

            <ul>
              ${weeklyActivityHtml}
            </ul>

            <h3 style="color: #91445F;">
              Tareas pendientes
            </h3>

            <ul>
              ${pendingTasksHtml}
            </ul>

            <hr style="
              border: none;
              border-top: 1px solid #eee5e8;
              margin: 25px 0;
            ">

            <p style="
              text-align: center;
              color: #91445F;
              font-weight: bold;
            ">
              Cada pequeño paso te acerca a tu próxima floración. 🌱
            </p>

            <p style="
              text-align: center;
              color: #a99ba0;
              font-size: 12px;
            ">
              Bloomy — Make your days bloom.
            </p>

          </div>
        </body>
      </html>
    `;

    // ==========================================
    // CONSTRUIR CORREO DE TEXTO PLANO
    // ==========================================

    const textBody = `
BLOOMY
Make your days bloom.

TU RESUMEN DE ACTIVIDADES

¡Hola!

TUS TAREAS

Total: ${totalTasks}
Completadas: ${completedTasks.length}
Pendientes: ${pendingTasks.length}
Progreso: ${completionPercentage}%

TU JARDÍN

Nivel: ${gardenLevel}
Etapa: ${gardenStageName}
Puntos acumulados: ${growthPoints}
Riegos realizados: ${totalWaterings}
Progreso del nivel: ${levelProgress.percentage}%

Próximo nivel: ${levelProgress.isMaxLevel
        ? '¡Alcanzaste el nivel máximo!'
        : `${levelProgress.pointsToNextLevel} puntos restantes`
      }

TU ACTIVIDAD SEMANAL

Completaste ${weeklyCompletedTasks} ${weeklyCompletedTasks === 1 ? 'tarea' : 'tareas'
      } durante los últimos siete días.

${weeklyActivityText}

TAREAS PENDIENTES

${pendingTasksText}

Cada pequeño paso te acerca a tu próxima floración.

Bloomy — Make your days bloom.
    `;

    // ==========================================
    // ENVIAR CORREO MEDIANTE AMAZON SES
    // ==========================================

    const command = new SendEmailCommand({
      Source: senderEmail,

      Destination: {
        ToAddresses: [email],
      },

      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Tu resumen de progreso de Bloomy',
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

    // ==========================================
    // RESPUESTA
    // ==========================================

    return res.status(200).json({
      success: true,
      message: 'Resumen enviado correctamente.',

      user: {
        uid: userId,
        email,
      },

      tasks: {
        total: totalTasks,
        pending: pendingTasks.length,
        completed: completedTasks.length,
        completionPercentage,
      },

      garden: {
        growthPoints,
        totalWaterings,
        level: gardenLevel,
        stage: gardenStage,
        stageName: gardenStageName,
        levelProgress,
      },

      weeklyActivity: {
        completedTasks: weeklyCompletedTasks,
        days: weeklyActivity,
      },

      messageId: emailResult.MessageId,
    });
  } catch (error: unknown) {
    console.error('ERROR GENERANDO O ENVIANDO EL RESUMEN:', error);

    return res.status(500).json({
      success: false,
      message: 'No se pudo generar o enviar el resumen de Bloomy.',
    });
  }
}