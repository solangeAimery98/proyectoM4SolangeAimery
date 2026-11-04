# Task Manager

Aplicación de gestión de tareas construida con React, TypeScript, Vite y Firebase.

## 📁 Estructura del Proyecto

```text
task-manager/
│
├── api/
│   └── send-summary.ts
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── TodoForm.tsx
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Tasks.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── AuthContext.tsx
│   │   │   └── authService.ts
│   │   │
│   │   └── tasks/
│   │       ├── taskService.ts
│   │       └── useTasks.ts
│   │
│   ├── services/
│   │   └── firebase/
│   │       ├── config.ts
│   │       ├── auth.ts
│   │       └── firestore.ts
│   │
│   ├── routes/
│   │   └── AppRouter.tsx
│   │
│   ├── hooks/
│   │
│   ├── types/
│   │   ├── Task.ts
│   │   └── User.ts
│   │
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── tests/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Instalación y Ejecución

1. Acceder al directorio:
   ```bash
   cd task-manager
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Variables de entorno:
   - Configura tus credenciales de Firebase en `.env` tomando como base `.env.example`.

4. Iniciar servidor local:
   ```bash
   npm run dev
   ```

