# MyTutor — Plataforma de Tutorías Online

Plataforma completa de reserva de tutorías online con arquitectura de 3 proyectos independientes.

## Proyectos

| Proyecto | Descripción | Puerto | Stack |
|----------|-------------|--------|-------|
| `backend` | API REST | 4000 | Node.js + TypeScript + Express + MongoDB |
| `frontend-next` | Web para estudiantes y profesores | 3000 | Next.js 14 + Tailwind + TanStack Query |
| `frontend-admin` | Panel administrativo | 3001 | React + Vite + Tailwind + TanStack Query |

## Inicio Rápido

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tu configuración
npm install
npm run dev        # Desarrollo
npm run seed       # Poblar con datos de prueba
```

### 2. Frontend Web

```bash
cd frontend-next
cp .env.example .env.local
# Edita con NEXT_PUBLIC_API_URL y NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm install
npm run dev        # http://localhost:3000
```

### 3. Frontend Admin

```bash
cd frontend-admin
cp .env.example .env
# Edita con VITE_API_URL y VITE_GOOGLE_CLIENT_ID
npm install
npm run dev        # http://localhost:3001
```

## Requisitos Previos

- Node.js >= 18
- MongoDB (local o Atlas)
- Cuenta de Google Cloud (para OAuth y Storage)
- Proyecto GCP con Google OAuth configurado

## Variables de Entorno

Cada proyecto tiene su propio `.env.example`. Las claves clave son:

### Backend (.env)
- `MONGODB_URI` — conexión a MongoDB
- `JWT_SECRET` — clave secreta para JWT
- `GOOGLE_CLIENT_ID` — Client ID de Google OAuth
- `GCS_BUCKET_NAME` — nombre del bucket en Google Cloud Storage
- `GCS_KEY_FILE_PATH` — ruta al archivo de credenciales JSON de GCS

### Frontend Web (.env.local)
- `NEXT_PUBLIC_API_URL` — URL del backend (default: http://localhost:4000/api)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Client ID de Google OAuth

### Frontend Admin (.env)
- `VITE_API_URL` — URL del backend
- `VITE_GOOGLE_CLIENT_ID` — Client ID de Google OAuth

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    MyTutor Platform                      │
├──────────────┬──────────────────┬───────────────────────┤
│ frontend-next│  frontend-admin  │      backend           │
│  (Next.js)   │  (React + Vite)  │  (Express + MongoDB)  │
│  Port: 3000  │  Port: 3001      │  Port: 4000            │
│              │                  │                         │
│ - Home       │ - Dashboard      │ - Auth (Google OAuth)  │
│ - Cursos     │ - Cursos         │ - Usuarios             │
│ - Profesores │ - Solicitudes    │ - Profesores           │
│ - Reservas   │ - Usuarios       │ - Cursos               │
│ - Dashboard  │ - Profesores     │ - Disponibilidad       │
│   Estudiante │ - Reservas       │ - Reservas             │
│ - Dashboard  │ - Reseñas        │ - Reseñas              │
│   Profesor   │ - Métricas       │ - Uploads (GCS)        │
└──────────────┴──────────────────┴───────────────────────┘
```

## Roles

| Rol | Acceso | Descripción |
|-----|--------|-------------|
| `student` | frontend-next | Busca y reserva tutorías |
| `teacher` | frontend-next | Gestiona agenda y confirma reservas |
| `admin` | frontend-admin | Gestiona catálogo y supervisa plataforma |

## Flujo de Reserva

1. Estudiante busca curso → ve profesores disponibles
2. Revisa perfil del profesor y su disponibilidad semanal
3. Selecciona un slot disponible
4. Sube comprobante de pago
5. Envía solicitud de reserva
6. Profesor revisa y aprueba/rechaza
7. Si aprueba → agrega enlace de Google Meet
8. Estudiante ve la reserva confirmada con el Meet link
9. Tras la sesión → estudiante puede dejar reseña (1-10)

## Estados de Reserva

```
pending_payment_upload → pending_review → confirmed → completed
                                       ↘ rejected
                       ↘ cancelled (por el estudiante)
```

## Google Cloud Setup

1. Crear proyecto en Google Cloud Console
2. Habilitar Google OAuth 2.0
3. Crear credenciales OAuth (Web application)
4. Agregar URLs de redirección autorizadas
5. Crear bucket en Cloud Storage
6. Crear Service Account con permisos de Storage
7. Descargar credentials JSON → `backend/gcs-credentials.json`
