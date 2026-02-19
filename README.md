# App Suscription

Sistema completo de gestión de suscripciones de clientes con integración de WhatsApp para comunicaciones automatizadas.

## Descripción

Aplicación web para gestionar clientes, suscripciones y comunicaciones via WhatsApp. Permite a administradores crear y gestionar clientes con sus respectivas suscripciones, mientras que los clientes pueden ver su estado de suscripción desde su panel personal.

### Características Principales

- **Gestión de Clientes**: Crear, editar, eliminar y listar clientes con información de contacto
- **Gestión de Suscripciones**: Control completo de suscripciones (crear, renovar, editar, eliminar)
- **Comunicaciones WhatsApp**: Envío de mensajes de plantilla y texto libre via Twilio
- **Automatización**: Jobs programados para verificar vencimientos y enviar recordatorios automáticos
- **Autenticación**: Sistema de login con Firebase Authentication y roles (admin, staff, client)
- **Panel de Cliente**: Vista restringida para que los usuarios vean su estado de suscripción

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + Firebase Admin SDK |
| Base de datos | Firebase Firestore |
| Auth | Firebase Authentication |
| Mensajería | Twilio (WhatsApp) |

## Estructura del Proyecto

```
src/
├── api.ts                 # Cliente HTTP para la API
├── App.tsx                # Enrutamiento principal
├── auth.tsx               # Sistema de autenticación
├── firebase.ts            # Configuración de Firebase
├── main.tsx               # Punto de entrada
├── styles.css             # Estilos globales
├── components/            # Componentes reutilizables
│   ├── AppLayout.tsx      # Layout principal
│   ├── ProtectedRoute.tsx # Ruta protegida
│   └── ui/                # Componentes de UI
├── context/               # Contextos de React
│   └── ThemeContext.tsx   # Tema claro/oscuro
├── pages/                 # Páginas principales
│   └── Login.tsx          # Página de login
└── views/                 # Vistas de la aplicación
    ├── AdminDashboard.tsx
    ├── ClientDashboard.tsx
    └── admin/             # Vistas de admin
        ├── AdminClients.tsx
        ├── AdminSubscriptions.tsx
        ├── AdminCommunication.tsx
        ├── AdminAutomation.tsx
        └── ...
```

## Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso completo a todas las funcionalidades |
| `staff` | Acceso limitado (principalmente comunicaciones) |
| `client` | Acceso restringido a sus propios datos |

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno:
   - Copia `.env.example` a `.env`
   - Añade las siguientes variables:
     ```
     VITE_FIREBASE_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN
     VITE_FIREBASE_PROJECT_ID
     VITE_FIREBASE_APP_ID
     VITE_API_BASE (URL base de la API externa)
     ```

3. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa de producción

## API Backend

La aplicación se conecta a una API backend. Consulta [`README_API.md`](README_API.md) para la documentación completa de los endpoints.
