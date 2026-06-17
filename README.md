# 🏗️ CONSTRUCTORA ACM 1 S.A.S. — Plataforma Corporativa

> Plataforma web institucional de alta calidad para la presentación de servicios de ingeniería civil, gestión de leads, testimonios y generación de cotizaciones formales.

---

## 📌 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Árbol de Directorios](#árbol-de-directorios)
4. [Configuración del Entorno](#configuración-del-entorno)
5. [Arquitectura del Backend (Insforge)](#arquitectura-del-backend-insforge)
6. [Panel Administrativo](#panel-administrativo)
7. [Asistente Virtual con IA](#asistente-virtual-con-ia)

---

## Descripción General

La plataforma de **CONSTRUCTORA ACM 1 S.A.S.** es una aplicación web moderna (SPA) diseñada para centralizar la operación comercial de la empresa. Permite desde la captación de prospectos hasta la generación de documentos legales de cotización, todo bajo una infraestructura escalable en la nube.

---

## Stack Tecnológico

| Tecnología | Propósito |
|---|---|
| **React 19** | Biblioteca principal para la interfaz de usuario. |
| **TypeScript** | Desarrollo robusto con tipado estático. |
| **Vite** | Entorno de desarrollo y empaquetado ultra rápido. |
| **Tailwind CSS 4** | Estilizado moderno y responsivo. |
| **Framer Motion** | Animaciones de alto impacto visual. |
| **Insforge (PostgreSQL)** | Backend-as-a-Service para base de datos y autenticación. |
| **@insforge/sdk** | SDK oficial para comunicación con el backend. |
| **Lucide React** | Set de íconos vectoriales premium. |

---

## Árbol de Directorios

```text
Constru_ACM1/
├── 📁 src/                          # Código fuente principal
│   ├── 📄 main.tsx                  # Punto de entrada de la aplicación
│   ├── 📄 App.tsx                   # Ensamblador raíz de componentes y vistas
│   ├── 📄 insforge.ts               # ★ Conexión central al backend (Reemplaza Firebase)
│   ├── 📄 index.css                 # Diseño base, fuentes y tokens de diseño
│   │
│   ├── 📁 components/               # Bloques modulares de la interfaz
│   │   ├── 📁 layout/               # Estructura fija (Navbar, Footer)
│   │   ├── 📁 sections/             # Secciones de la Landing (Hero, About, Experience, etc.)
│   │   ├── 📁 admin/                # ★ Módulo administrativo corporativo
│   │   │   ├── 📄 AdminDashboard.tsx # Orquestador del panel (Login + Navegación)
│   │   │   ├── 📁 views/            # Vistas internas (Leads, Testimonios, Cotizador)
│   │   │   └── 📄 types.ts          # Definiciones de datos (Quote, Lead, Testimonial)
│   │   └── 📄 WhatsAppButton.tsx    # Botón flotante de contacto directo
│   │
│   └── 📁 assets/                   # Recursos visuales (Imágenes, Logos)
│
├── 📄 .env.local                    # Variables de entorno sensibles (URL, Keys)
├── 📄 database-schema.sql           # ★ Esquema de base de datos para Insforge
├── 📄 package.json                  # Gestión de dependencias y scripts
└── 📄 vite.config.ts                # Configuración de compilación y chunks
```

---

## Configuración del Entorno

El proyecto requiere un archivo `.env.local` en la raíz con las siguientes claves:

```env
# URL del backend en Insforge (obtenida desde la consola)
VITE_INSFORGE_URL=https://tu-proyecto.insforge.app
# Clave anónima pública
VITE_INSFORGE_ANON_KEY=ik_...
```

---

## Arquitectura del Backend (Insforge)

La aplicación utiliza **Insforge** como motor de base de datos relacional (PostgreSQL).

### Tablas Principales:
1.  **`quotes`**: Almacena las solicitudes de los clientes desde la web.
2.  **`testimonials`**: Comentarios de clientes (requieren aprobación para ser visibles).
3.  **`generated_quotes`**: Registro histórico de cotizaciones formales emitidas.

### Seguridad (RLS):
Se utilizan políticas de **Row Level Security** para que:
- Cualquier usuario pueda enviar una solicitud (INSERT).
- Solo el administrador autenticado pueda leer y modificar los datos (SELECT/UPDATE).

---

## Panel Administrativo Corporativo

Acceso exclusivo y seguro para los administradores del negocio mediante autenticación **Insforge**.

- **Multi-Administrador**: Soporte para múltiples correos autorizados (`constructoraacm1@outlook.com`, `jamosquera0518@gmail.com`).
- **Gestión de Leads**: Cambio de estados (Nuevo, En Proceso, Cotizado, Rechazado).
- **Moderación de Testimonios**: Control de calidad sobre lo que se publica en la web.
- **Generador de Cotizaciones**: Herramienta avanzada para crear PDFs profesionales y hojas de cálculo (XLSX) con partidas de obra automáticas.
- **Historial y Trazabilidad**: Visualización y edición de cotizaciones pasadas.

---

## 🛡️ Ciberseguridad y Manejo de Sesión

El portal ha sido blindado con medidas de seguridad de grado corporativo:

- **Honeypot Anti-Spam**: Campos ocultos en los formularios públicos para bloquear envíos automatizados por bots.
- **Sanitización de Entradas**: Limpieza exhaustiva de datos (`trim`, `toLowerCase`) antes de interactuar con la base de datos.
- **Validación "Zero Trust"**: Expulsión automática (`logout`) de cualquier sesión que no pertenezca estrictamente a la lista blanca de correos autorizados.
- **Persistencia Inteligente**: Uso de almacenamiento local cifrado (`acm_admin_session`) para recuperar la sesión del administrador silenciosamente al recargar la página, sin obligar a iniciar sesión múltiples veces.
- **Monitor de Inactividad**: Cierre de sesión automático tras 30 minutos sin interacción.

---

## 📲 Integración de Contacto Directo

Se priorizó el contacto humano y directo por encima de soluciones automatizadas:

- **Botón Flotante Premium**: Integración de WhatsApp persistente con animaciones interactivas.
- **Mensajes Pre-formateados**: Los clientes inician el chat con un mensaje estructurado (*"Hola que tal, me comunico con ustedes porque estoy interesado en llevar a cabo un proyecto..."*), mejorando la captación inicial.
- **Enlaces Corporativos**: Redirecciones precisas para llamadas directas y correos desde el pie de página.

---

## Optimizaciones de Rendimiento

- **Lazy Loading**: El panel administrativo (`AdminDashboard`) se carga bajo demanda utilizando `React.lazy()` y `Suspense`, lo que reduce significativamente el tamaño del bundle inicial.
- **Code Splitting**: Configurado en `vite.config.ts` para separar librerías pesadas (PDF, Excel, Insforge) en chunks independientes.
- **Bundle Optimizado**: Eliminación de dependencias no utilizadas (`@google/genai`, `react-markdown`) para maximizar la velocidad de renderizado (LCP y TTI).

---

## Nota sobre Versiones Legacy

El directorio `Constructora_ACM1` (con 'C' mayúscula) contiene una versión obsoleta basada en Firebase. Todo el desarrollo actual, activo y optimizado se encuentra en este directorio (`construc_acm1`).

---
*Desarrollado para CONSTRUCTORA ACM 1 S.A.S. — Proyecto Finalizado y Optimizado — © 2026*
