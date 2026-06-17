/**
 * @file types.ts
 * @description Tipos TypeScript compartidos entre todos los módulos del panel administrativo.
 * @module admin/types
 */

/** Partida individual dentro de una cotización */
export interface QuoteItem {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

/** Datos completos de una cotización formal */
export interface QuoteData {
  /** Número único de cotización. Ej: ACM-2025-0001 */
  quoteNumber: string;
  /** Fecha de emisión formateada (dd/mm/yyyy) */
  issueDate: string;
  /** Fecha límite de validez formateada (dd/mm/yyyy) */
  validUntil: string;
  /** Días de validez de la cotización */
  validityDays: number;

  /** Nombre del cliente o empresa */
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  /** Servicio solicitado (obtenido del lead o escrito manualmente) */
  service: string;
  /** Fecha original de la solicitud del cliente */
  requestDate?: string;

  /** Líneas de detalle de la cotización */
  items: QuoteItem[];

  /** Resumen financiero */
  subtotal: number;
  discount: number;        // Porcentaje de descuento (0-100)
  discountAmount: number;  // Valor absoluto del descuento
  includeIva: boolean;
  ivaAmount: number;
  total: number;

  /** Condiciones comerciales */
  paymentTerms: string;
  notes: string;
}

/** Estructura de un lead (solicitud de cotización) guardado en Firestore */
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  createdAt?: string;
  status?: 'nuevo' | 'cotizado' | 'cerrado';
}

/** Estructura de un testimonio guardado en Insforge */
export interface Testimonial {
  id: string;
  name: string;
  project?: string;
  rating: number;
  comment: string;
  image?: string;
  approved: boolean;
  created_at?: string;
}

/** Estructura de una cotización ya guardada en la base de datos (PostgreSQL) */
export interface GeneratedQuote {
  id: string;
  quote_number: string;
  issue_date: string;
  valid_until: string;
  validity_days: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  request_date?: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  discount_amount: number;
  include_iva: boolean;
  iva_amount: number;
  total: number;
  payment_terms: string;
  notes: string;
  lead_id?: string;
  created_at: string;
  updated_at: string;
}
