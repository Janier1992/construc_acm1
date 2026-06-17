# Security Specification — CONSTRUCTORA ACM 1 S.A.S.

## 1. Backend: Insforge (PostgreSQL + Row Level Security)

### Tablas Principales
- **`quotes`**: Solicitudes de clientes desde la web.
- **`testimonials`**: Comentarios de clientes (requieren aprobación).
- **`generated_quotes`**: Historial de cotizaciones formales emitidas.

### Políticas RLS
- `INSERT` público: cualquier visitante puede enviar una solicitud o testimonio.
- `SELECT / UPDATE` restringido: solo usuarios autenticados con correo en la whitelist.
- `DELETE` deshabilitado en `quotes` (trazabilidad / auditoría).

## 2. Autenticación y Control de Acceso

- **Whitelist de correos** (`AUTHORIZED_EMAILS`): solo correos autorizados pueden acceder al panel administrativo.
- **Validación Zero Trust**: si un usuario inicia sesión con un correo no autorizado, se ejecuta `logout()` inmediatamente.
- **Persistencia de sesión**: almacenamiento local cifrado (`acm_admin_session`) para restaurar la sesión sin re-login.
- **Monitor de inactividad**: cierre automático de sesión tras 30 minutos sin interacción.

## 3. Protección Anti-Spam en Formularios Públicos

- **Honeypot fields**: campos ocultos que solo bots completan → envío bloqueado silenciosamente.
- **Sanitización de entradas**: `trim()`, `toLowerCase()` en datos antes de enviarlos a la base de datos.

## 4. Variables de Entorno

- `.env.local` incluido en `.gitignore` — nunca se sube al repositorio.
- Solo claves públicas (`VITE_INSFORGE_ANON_KEY`) expuestas al frontend.
- Template disponible en `.env.local.example` para onboarding.

## 5. Build y Despliegue

- Code splitting para minimizar el bundle inicial.
- Lazy loading del panel administrativo (`React.lazy` + `Suspense`).
- `robots.txt` bloquea indexación de rutas administrativas (`/admin`, `/?showAdmin=true`).
