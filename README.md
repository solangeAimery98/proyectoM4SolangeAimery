🌸 Bloomy — Make your days bloom

Bloomy es una aplicación web de gestión de tareas que combina productividad y gamificación. Permite organizar actividades, realizar un seguimiento del progreso personal y cultivar un jardín virtual que crece a medida que se completan objetivos.

Cada pequeña tarea es un paso para hacer florecer tu día. 🌱

<p align="center">
  <strong>Make your days bloom.</strong>
</p>

⸻

🌷 Demo

Aplicación en producción:
https://task-manager-delta-sandy.vercel.app

Repositorio:
GitHub — Bloomy

Demostración del envío de resumen por email

La aplicación permite generar y enviar un resumen de productividad mediante una función serverless integrada con AWS SES.

⸻

✨ Funcionalidades principales

🔐 Autenticación

* Registro de usuarios.
* Inicio y cierre de sesión.
* Autenticación mediante Firebase Authentication.
* Persistencia de sesión.
* Protección de rutas privadas y públicas.

📝 Gestión de tareas

* Crear nuevas tareas.
* Editar tareas existentes.
* Eliminar tareas.
* Marcar tareas como completadas y pendientes.
* Búsqueda de tareas.
* Filtrado por estado.
* Actualización en tiempo real mediante Firestore.

🌱 Jardín virtual y gamificación

Bloomy incorpora un sistema de progresión que transforma las tareas completadas en puntos de crecimiento.

* Cada tarea completada por primera vez otorga 10 puntos.
* Los puntos se acumulan para desbloquear nuevos niveles.
* El progreso se conserva entre sesiones.
* Completar nuevamente una tarea ya recompensada no genera puntos adicionales.

El jardín cuenta con cinco niveles de crecimiento:

Nivel	Puntos necesarios	Etapa
1	0	Brote
2	50	Primeras hojas
3	100	Crecimiento
4	200	Floración
5	350	Plena floración

📊 Resumen de productividad

La sección de resumen permite visualizar:

* Total de tareas creadas.
* Tareas pendientes.
* Tareas completadas.
* Progreso de productividad.
* Actividad semanal.
* Nivel y progreso del jardín.

También permite solicitar el envío del resumen por correo electrónico.

📧 Envío de resumen por email

La funcionalidad de envío utiliza una API serverless desplegada en Vercel e integrada con AWS Simple Email Service (SES).

El flujo incluye:

1. Autenticación del usuario mediante Firebase Authentication.
2. Verificación del token de acceso en el backend.
3. Consulta de los datos del usuario en Firestore.
4. Generación del resumen de productividad.
5. Construcción del contenido HTML y texto del correo.
6. Envío mediante AWS SES.

La integración se encuentra desplegada y probada en el entorno de producción, utilizando el modo sandbox de AWS SES.

⸻

🛠️ Tecnologías utilizadas

Frontend

* React 18
* TypeScript
* Vite
* React Router DOM 6
* CSS3

Backend y servicios

* Firebase Authentication
* Cloud Firestore
* Firebase Admin SDK
* Vercel Serverless Functions
* AWS Simple Email Service (SES)
* AWS SDK for JavaScript v3

Testing

* Vitest
* React Testing Library
* Jest DOM
* User Event
* jsdom
* Firebase Rules Unit Testing

⸻

🏗️ Arquitectura del proyecto

El proyecto utiliza una arquitectura organizada por funcionalidades y responsabilidades, separando componentes visuales, lógica de negocio, servicios y configuración.

task-manager/
│
├── api/
│   ├── lib/
│   │   └── firebaseAdmin.ts
│   └── send-summary.ts
│
├── docs/
│   ├── evidencias/
│   │   └── demo-envio-email.gif
│   └── ia/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── garden/
│   │   └── layout/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── garden/
│   │   └── tasks/
│   │
│   ├── pages/
│   ├── routes/
│   ├── services/
│   │   └── firebase/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── tests/
│   ├── api/
│   ├── features/
│   ├── security/
│   └── ...
│
├── firestore.rules
├── index.html
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md

Organización de responsabilidades

* components: componentes reutilizables de interfaz.
* features: lógica y servicios organizados por funcionalidad.
* pages: páginas principales de la aplicación.
* routes: configuración de navegación y rutas.
* services: integración con servicios externos.
* types: definiciones de tipos e interfaces.
* utils: funciones auxiliares.
* api: endpoints serverless y servicios administrativos.
* tests: pruebas unitarias, de componentes, API y seguridad.

⸻

🚀 Instalación y ejecución local

Requisitos previos

* Node.js
* npm
* Una cuenta de Firebase.
* Configuración de AWS SES para utilizar el envío de correos.

1. Clonar el repositorio

git clone https://github.com/solangeAimery98/proyectoM4SolangeAimery.git

2. Ingresar al proyecto

cd task-manager

3. Instalar dependencias

npm install

4. Configurar variables de entorno

Crear un archivo .env en la raíz del proyecto.

Las variables necesarias para el frontend son:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

Para el backend también se requieren:

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
SES_FROM_EMAIL=

Las credenciales privadas deben mantenerse secretas y nunca deben publicarse en el repositorio.

5. Ejecutar en desarrollo

npm run dev

La aplicación estará disponible en la dirección local indicada por Vite.

⸻

🧪 Testing

El proyecto cuenta con pruebas para verificar el comportamiento de sus principales funcionalidades.

Ejecutar los tests principales

npm run test:run

Ejecutar los tests de seguridad de Firestore

npm run test:security

Requiere tener disponible el emulador de Firestore.

Para iniciarlo:

npx firebase emulators:start --only firestore

Ejecutar los tests del sistema de jardín

npm run test:garden

Ejecutar todas las suites

npm run test:all

⸻

🔒 Seguridad

La aplicación implementa diferentes mecanismos para proteger los datos y las operaciones de los usuarios:

* Autenticación mediante Firebase Authentication.
* Protección de rutas privadas.
* Verificación de tokens en el backend.
* Filtrado de datos por identificador de usuario.
* Reglas de seguridad de Firestore.
* Validación de los datos recibidos.
* Restricción de campos y operaciones permitidas.
* Uso de variables de entorno para credenciales privadas.

Cada usuario puede acceder únicamente a sus propios datos.

⸻

☁️ Deploy

La aplicación está desplegada en Vercel.

Los servicios utilizados en producción son:

* Vercel para el frontend y las funciones serverless.
* Firebase Authentication para la gestión de usuarios.
* Cloud Firestore para persistencia de datos.
* AWS SES para el envío de correos electrónicos.

La aplicación utiliza variables de entorno configuradas en Vercel para separar las credenciales públicas del frontend de las credenciales privadas del backend.

⸻

🤖 Uso de inteligencia artificial

Durante el desarrollo se utilizaron herramientas de inteligencia artificial como apoyo en distintas etapas del proyecto.

Su utilización incluyó asistencia en arquitectura, implementación, organización del código, diseño visual, debugging, testing y documentación.

Las herramientas utilizadas y sus intervenciones se detallan en:

Documentación de uso de IA

⸻

🎨 Identidad visual

Bloomy utiliza una identidad visual inspirada en el minimalismo botánico.

Su diseño busca transmitir calma, crecimiento y organización mediante:

* Colores pastel.
* Tonos rosa, crema y verde salvia.
* Tipografía combinada para jerarquizar contenidos.
* Elementos botánicos.
* Interfaz responsive.
* Componentes visuales simples y reutilizables.

El diseño está pensado para ofrecer una experiencia clara y agradable tanto en dispositivos móviles como en escritorio.

⸻

👩‍💻 Autora

Solange Aimery

Proyecto desarrollado como parte del Proyecto Integrador 4 de Henry.

Bloomy — Make your days bloom. 🌸