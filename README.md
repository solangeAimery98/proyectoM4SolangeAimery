<div align="center">

🌸 Bloomy

Make your days bloom.

Tu productividad también puede florecer.

Una aplicación web de gestión de tareas que combina organización, seguimiento de objetivos y gamificación mediante un jardín virtual que crece con cada logro.

🌷 Aplicación en producción

💻 Repositorio GitHub

</div>

⸻

🌿 Sobre el proyecto

Bloomy es una aplicación web desarrollada como Proyecto Integrador del Módulo 4 de Henry.

Nace de la idea de transformar la gestión cotidiana de tareas en una experiencia más motivadora y visual.

A diferencia de un administrador de tareas tradicional, Bloomy incorpora un sistema de gamificación en el que cada tarea completada contribuye al crecimiento de un jardín virtual.

Su objetivo es ayudar a los usuarios a organizar sus actividades, visualizar su progreso y construir hábitos de productividad de una manera más agradable.

La aplicación cuenta con autenticación de usuarios, persistencia de datos en tiempo real, estadísticas de actividad y un sistema de recompensas integrado con Firebase.

⸻

✨ Funcionalidades principales

🌷 Gestión de tareas

* Creación, visualización, edición y eliminación de tareas.
* Posibilidad de marcar tareas como completadas o pendientes.
* Actualización automática de los datos en tiempo real mediante Firestore.
* Búsqueda de tareas.
* Filtros para organizar las actividades.
* Validación de datos antes de guardar cambios.
* Estados de carga, confirmación y error.

🔐 Autenticación y usuarios

* Registro de nuevas cuentas.
* Inicio y cierre de sesión.
* Persistencia de sesión mediante Firebase Authentication.
* Rutas públicas y privadas.
* Protección de las páginas que requieren autenticación.
* Aislamiento de los datos: cada usuario accede exclusivamente a sus propias tareas.

🌱 Jardín virtual y gamificación

Una de las características distintivas de Bloomy es su sistema de progresión.

Cada vez que un usuario completa una tarea por primera vez, obtiene 10 puntos de crecimiento que contribuyen a la evolución de su jardín virtual.

El jardín cuenta con cinco niveles:

Nivel	Puntos necesarios	Etapa
🌱 1	0	Sprout
🍃 2	50	First Leaves
🌿 3	100	Growth
🌸 4	200	Flowering
🌺 5	350	Full Bloom

El sistema de recompensas utiliza transacciones de Firestore para garantizar que los puntos se acrediten correctamente.

Reglas de progresión:

* Cada tarea otorga puntos una sola vez.
* Desmarcar una tarea no elimina los puntos obtenidos.
* Volver a completar una tarea no genera recompensas adicionales.
* La progresión del jardín se conserva entre sesiones.

De esta manera, el crecimiento del jardín representa el progreso acumulado del usuario.

📊 Dashboard y estadísticas

* Panel principal con resumen de actividades.
* Indicadores de tareas pendientes y completadas.
* Progreso general.
* Búsqueda y filtrado de tareas.
* Panel de jardín virtual.
* Interfaz adaptable a dispositivos móviles, tablets y computadoras.

📩 Resumen de actividad por email

Bloomy permite solicitar un resumen de actividad mediante un correo electrónico generado dinámicamente.

La funcionalidad utiliza una API Serverless desplegada en Vercel, Firebase Admin SDK y Amazon Simple Email Service (AWS SES).

El resumen incluye estadísticas de tareas, progreso del jardín y actividad semanal.

📱 Diseño responsive

La interfaz fue diseñada siguiendo una identidad visual propia:

* Paleta pastel con tonos rosa, crema y verde salvia.
* Tipografía cuidadosamente seleccionada.
* Detalles botánicos.
* Diseño minimalista, delicado y moderno.
* Navegación lateral en escritorio.
* Navegación inferior en dispositivos móviles.

⸻

🛠️ Tecnologías utilizadas

Área	Tecnología
Frontend	React 18
Lenguaje	TypeScript
Build Tool	Vite
Navegación	React Router DOM 6
Autenticación	Firebase Authentication
Base de datos	Cloud Firestore
Reglas de seguridad	Firebase Security Rules
Backend	Vercel Serverless Functions
Administración Firebase	Firebase Admin SDK
Envío de emails	AWS SES
SDK de AWS	AWS SDK for JavaScript v3
Testing	Vitest
Testing de componentes	React Testing Library
Testing de interacciones	User Event
Entorno de pruebas	jsdom
Despliegue	Vercel
Control de versiones	Git y GitHub

⸻

🏗️ Arquitectura del proyecto

El proyecto utiliza una arquitectura organizada por responsabilidades, separando la interfaz, la lógica de negocio, los servicios externos y la autenticación.

task-manager/
│
├── api/
│   └── send-summary.ts
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
│   │   │   ├── AuthContext.tsx
│   │   │   └── authService.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── taskService.ts
│   │   │   └── useTasks.ts
│   │   │
│   │   └── garden/
│   │
│   ├── hooks/
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Tasks.tsx
│   │   └── Summary.tsx
│   │
│   ├── routes/
│   │   └── AppRouter.tsx
│   │
│   ├── services/
│   │   └── firebase/
│   │       ├── config.ts
│   │       ├── auth.ts
│   │       └── firestore.ts
│   │
│   ├── styles/
│   │
│   ├── types/
│   │   ├── Task.ts
│   │   └── User.ts
│   │
│   ├── utils/
│   │   └── firebaseErrors.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── tests/
│   ├── api/
│   ├── components/
│   ├── features/
│   ├── pages/
│   └── security/
│
├── firestore.rules
├── vercel.json
├── vite.config.ts
├── vitest.security.config.ts
├── vitest.garden.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md

Responsabilidades de las principales capas

Components

Contienen los elementos visuales reutilizables de la aplicación, como el dashboard, los filtros, la navegación y el jardín virtual.

Features

Agrupan la lógica de negocio según su funcionalidad.

* auth: gestión de autenticación y estado del usuario.
* tasks: operaciones CRUD, suscripciones y lógica de tareas.
* garden: lógica relacionada con la progresión y las recompensas.

Pages

Representan las pantallas principales de la aplicación: Login, Register, Tasks y Summary.

Services

Centralizan la comunicación con Firebase y sus servicios.

Routes

Gestionan la navegación y la protección de rutas.

API

Contiene las funciones Serverless que se ejecutan en el servidor. Actualmente incluye el endpoint encargado de generar y enviar el resumen de actividad.

⸻

🔥 Firebase y persistencia de datos

Bloomy utiliza Firebase como infraestructura principal para autenticación y persistencia.

Firebase Authentication

Se encarga de registrar usuarios, iniciar y cerrar sesiones y mantener el estado de autenticación.

El contexto de autenticación permite que los componentes conozcan al usuario actual y reaccionen a los cambios de sesión.

Cloud Firestore

Las tareas se almacenan en la colección tasks.

Cada documento representa una tarea asociada a un usuario.

Campo	Tipo	Descripción
id	string	Identificador del documento.
title	string	Título de la tarea.
description	string	Descripción de la tarea.
completed	boolean	Estado de finalización.
userId	string	Identificador del propietario.
createdAt	Timestamp	Fecha de creación.
completedAt	Timestamp / null	Fecha de finalización.

La aplicación utiliza onSnapshot para escuchar cambios en tiempo real y mantener sincronizada la interfaz con Firestore.

Seguridad de Firestore

Las reglas de seguridad se implementan directamente en Firebase para validar las operaciones sobre los documentos.

Entre las validaciones se encuentran:

* Autenticación obligatoria.
* Acceso limitado al propietario de cada tarea.
* Validación de tipos de datos.
* Validación de campos permitidos.
* Límites de longitud para títulos y descripciones.
* Prevención de modificaciones indebidas del identificador del propietario.
* Validación de fechas de finalización.
* Protección de las operaciones relacionadas con recompensas.

La seguridad se aplica en la base de datos y no depende exclusivamente de las validaciones visuales del frontend.

El archivo de reglas se encuentra en firestore.rules.

⸻

🌸 Sistema de progresión del jardín

El sistema de gamificación está diseñado para que las acciones del usuario tengan una recompensa persistente.

La lógica de progresión se encuentra separada de la interfaz, permitiendo calcular el nivel, la etapa visual y el progreso hacia el siguiente nivel.

La acreditación de puntos y la finalización de una tarea se realizan mediante una transacción de Firestore.

Esto evita que una misma tarea genere recompensas duplicadas ante operaciones concurrentes o repetidas.

El estado del jardín se conserva en Firestore y puede recuperarse cuando el usuario vuelve a iniciar sesión.

⸻

📩 Integración Serverless y AWS SES

El envío de resúmenes por correo electrónico utiliza una arquitectura desacoplada entre frontend y backend.

Flujo de funcionamiento

1. El usuario solicita el envío desde la pantalla Summary.
2. El frontend obtiene el token de autenticación de Firebase.
3. Envía una solicitud HTTP POST a /api/send-summary.
4. La función Serverless verifica el token mediante Firebase Admin SDK.
5. El servidor identifica al usuario autenticado.
6. Consulta las tareas y el progreso correspondiente a ese usuario.
7. Genera el contenido HTML y texto plano del resumen.
8. Envía el mensaje mediante AWS SES.
9. Devuelve una respuesta a la aplicación.
10. La interfaz informa si la operación fue exitosa o si ocurrió un error.

El destinatario se obtiene de la identidad autenticada y no de una dirección arbitraria enviada por el navegador.

Seguridad del backend

* Verificación del token de Firebase en el servidor.
* Consultas limitadas al usuario autenticado.
* Validación del método HTTP.
* Validación de la configuración del servicio de correo.
* Manejo de errores de Firebase y AWS SES.
* Escape del contenido dinámico incorporado al HTML.
* Credenciales privadas almacenadas exclusivamente como variables de entorno del servidor.

AWS SES Sandbox

La integración fue configurada y probada utilizando el entorno Sandbox de AWS SES.

En este modo, AWS SES aplica restricciones sobre las direcciones remitentes y destinatarias verificadas.

La integración permite comprobar el funcionamiento de la API y la aceptación del envío por parte del servicio, sin que el proyecto dependa de habilitar el envío masivo a destinatarios externos.

⸻

🧪 Testing y calidad

El proyecto cuenta con una suite de pruebas automatizadas implementada con Vitest y React Testing Library.

Las pruebas verifican el comportamiento de los componentes, hooks, servicios, autenticación, reglas de seguridad y funciones Serverless.

Resultados de las pruebas

190 tests aprobados — 0 fallidos.

Suite	Tests aprobados
Suite principal	158
Seguridad de Firestore	27
Progresión del jardín	5
Total	190

Cobertura de código

Métrica	Cobertura
Statements	94.8%
Branches	93.26%
Functions	88.88%
Lines	94.8%

Áreas verificadas

* Autenticación y persistencia de sesión.
* Registro, inicio y cierre de sesión.
* Protección y redirección de rutas.
* Operaciones CRUD de tareas.
* Sincronización mediante Firestore.
* Manejo de errores.
* Progresión y recompensas del jardín.
* Validaciones de seguridad de Firestore.
* Generación y envío del resumen por email.
* Manejo de errores de AWS SES.
* Comportamiento de componentes y páginas.

Ejecutar las pruebas

# Suite principal
npm run test:run
# Reglas de seguridad de Firestore
npm run test:security
# Progresión y gamificación
npm run test:garden
# Ejecutar todas las suites
npm run test:all

Para ejecutar las pruebas de seguridad es necesario contar con el emulador de Firestore.

npx firebase emulators:start --only firestore

En otra terminal:

npm run test:security

⸻

🚀 Instalación y ejecución local

Requisitos

* Node.js.
* npm.
* Proyecto de Firebase configurado.
* Firebase Authentication habilitado.
* Cloud Firestore habilitado.
* Cuenta de AWS con AWS SES configurado para probar el envío de emails.

1. Clonar el repositorio

git clone https://github.com/solangeAimery98/proyectoM4SolangeAimery.git

2. Ingresar al proyecto

cd proyectoM4SolangeAimery

3. Instalar dependencias

npm install

4. Configurar variables de entorno

Crear un archivo .env tomando como referencia .env.example.

cp .env.example .env

Completar las variables correspondientes.

5. Ejecutar el frontend

npm run dev

Vite iniciará el servidor local y mostrará la dirección para acceder a Bloomy.

Importante: el comando npm run dev inicia el frontend. Para probar las funciones Serverless de Vercel localmente también es necesario utilizar el entorno de desarrollo de Vercel y configurar las variables privadas correspondientes.

⸻

⚙️ Variables de entorno

Bloomy utiliza variables públicas para el frontend y variables privadas para el servidor.

Frontend — Firebase

Variable	Descripción
VITE_FIREBASE_API_KEY	API Key de Firebase.
VITE_FIREBASE_AUTH_DOMAIN	Dominio de autenticación.
VITE_FIREBASE_PROJECT_ID	Identificador del proyecto.
VITE_FIREBASE_STORAGE_BUCKET	Bucket de almacenamiento.
VITE_FIREBASE_MESSAGING_SENDER_ID	Identificador del remitente.
VITE_FIREBASE_APP_ID	Identificador de la aplicación.

Las variables con prefijo VITE_ son incorporadas al frontend durante el proceso de build.

Backend — Firebase Admin y AWS SES

Variable	Descripción
FIREBASE_PROJECT_ID	Identificador del proyecto Firebase.
FIREBASE_CLIENT_EMAIL	Email de la cuenta de servicio de Firebase Admin.
FIREBASE_PRIVATE_KEY	Clave privada de Firebase Admin.
AWS_ACCESS_KEY_ID	Credencial de acceso de AWS.
AWS_SECRET_ACCESS_KEY	Clave secreta de AWS.
AWS_REGION	Región de AWS.
SES_FROM_EMAIL	Dirección remitente configurada en AWS SES.

Las variables privadas deben configurarse exclusivamente en el entorno del servidor.

Nunca se deben subir archivos .env ni credenciales privadas al repositorio.

⸻

☁️ Despliegue

Bloomy se encuentra desplegada en Vercel.

Aplicación: Abrir Bloomy

Repositorio: GitHub

El proyecto utiliza integración con GitHub para automatizar los deployments.

Los cambios enviados a la rama main pueden generar automáticamente un nuevo deployment de producción.

Configuración de rutas SPA

El archivo vercel.json contiene una regla de reescritura que permite que React Router gestione las rutas de la aplicación.

{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

Esta configuración permite acceder directamente a rutas como /login y /summary, y recargar el navegador sin recibir un error 404 del servidor.

⸻

🤖 Uso de inteligencia artificial

Durante el desarrollo de Bloomy utilicé herramientas de inteligencia artificial como apoyo al aprendizaje, la resolución de problemas y la mejora del código.

Las principales herramientas utilizadas fueron ChatGPT y Claude Code.

ChatGPT fue utilizado como asistente de aprendizaje y acompañamiento técnico para:

* Comprender conceptos de React, TypeScript, Firebase y arquitectura frontend.
* Analizar errores y evaluar alternativas de implementación.
* Revisar decisiones técnicas.
* Diseñar estrategias de testing.
* Comprender problemas de integración y despliegue.

Claude Code fue utilizado como herramienta de asistencia directa sobre el código para:

* Analizar archivos y estructuras del proyecto.
* Proponer e implementar modificaciones.
* Colaborar en la creación y actualización de pruebas.
* Revisar implementaciones y detectar posibles problemas.

La utilización de estas herramientas no reemplazó mi participación ni mi responsabilidad sobre el proyecto.

Las propuestas fueron revisadas, evaluadas y probadas antes de incorporarse. Las decisiones de arquitectura, las funcionalidades, la aceptación de cambios y la validación del resultado formaron parte de mi proceso de desarrollo.

Uno de los aprendizajes más importantes fue comprender que utilizar inteligencia artificial para programar no significa aceptar automáticamente el código generado, sino desarrollar el criterio necesario para entenderlo, cuestionarlo y verificarlo.

⸻

<div align="center">

🌸 Make your days bloom.

Bloomy — Proyecto Integrador del Módulo 4

Desarrollado por Solange Aimery

Henry | Full Stack Development

</div>