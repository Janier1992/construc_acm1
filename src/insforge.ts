/**
 * @file insforge.ts
 * @description Archivo de conexión principal al backend Insforge.
 *
 * Insforge es un servicio de base de datos compatible con la API de Supabase
 * (PostgreSQL + Auth + Storage). Este archivo reemplaza a firebase.ts y expone
 * los clientes de base de datos y autenticación para toda la aplicación.
 *
 * VARIABLES DE ENTORNO REQUERIDAS (ver .env.local):
 *   VITE_INSFORGE_URL      → URL del proyecto en Insforge
 *   VITE_INSFORGE_ANON_KEY → Clave pública anónima (safe para el frontend)
 *
 * NOTA PARA EL ADMINISTRADOR:
 *   Si Insforge provee su propio paquete npm, reemplace la línea de import:
 *   ACTUAL:   import { createClient } from '@supabase/supabase-js';
 *   NUEVO:    import { createClient } from '@insforge/client';  (ejemplo)
 *
 * @module insforge
 */
import { createClient } from '@insforge/sdk';

// ── Variables de entorno de Insforge ─────────────────────────────────────────
const INSFORGE_URL: string     = (import.meta.env.VITE_INSFORGE_URL || '').replace(/\/$/, '');
const INSFORGE_ANON_KEY: string = import.meta.env.VITE_INSFORGE_ANON_KEY || '';

// Validación en desarrollo: alertar si faltan las variables de entorno
if (import.meta.env.DEV) {
  if (!INSFORGE_URL || !INSFORGE_ANON_KEY) {
    console.error(
      '⚠️  [Insforge] Faltan variables de entorno.\n' +
      '   Configure VITE_INSFORGE_URL y VITE_INSFORGE_ANON_KEY en el archivo .env.local'
    );
  }
}

/**
 * Cliente principal de Insforge.
 * Proporciona acceso a la base de datos y autenticación.
 */
export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

/**
 * Cliente de autenticación de Insforge.
 */
export const insforgeAuth = insforge.auth;

/**
 * Helper para obtener el usuario administrador actual.
 */
export const getCurrentUser = async () => {
  const { data } = await insforge.auth.getCurrentUser();
  return data?.user;
};
