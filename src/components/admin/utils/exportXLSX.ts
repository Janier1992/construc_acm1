/**
 * @file exportXLSX.ts
 * @description Utilidad para exportar cotizaciones en formato Excel (.xlsx) usando SheetJS.
 * Genera una hoja de cálculo estructurada con encabezado corporativo, tabla de partidas
 * y resumen financiero, lista para entregar al cliente o usar internamente.
 * @module admin/utils/exportXLSX
 */
import * as XLSX from 'xlsx';
import { QuoteData } from '../types';

/**
 * Genera y descarga un archivo Excel (.xlsx) con la cotización formal.
 * @param data - Datos completos de la cotización.
 */
export function exportQuoteXLSX(data: QuoteData): void {
  // Crear un nuevo libro de trabajo (workbook)
  const wb = XLSX.utils.book_new();

  // ── Construcción del contenido de la hoja ────────────────────────────────────
  const rows: any[][] = [
    // Bloque 1: Encabezado corporativo
    ['CONSTRUCTORA ACM 1 S.A.S.'],
    ['NIT: 901.909.512  |  Medellín, Antioquia  |  Colombia'],
    ['Tel: 314 893 8973  |  constructoraacm1@outlook.com'],
    ['Carrera 105 # 50-44, Medellín'],
    [],

    // Bloque 2: Datos de la cotización
    ['COTIZACIÓN N°:', data.quoteNumber, '', 'FECHA DE EMISIÓN:', data.issueDate],
    ['VÁLIDA HASTA:', data.validUntil, '', 'VIGENCIA (DÍAS):', `${data.validityDays} días`],
    [],

    // Bloque 3: Datos del cliente
    ['DATOS DEL CLIENTE'],
    ['Cliente / Empresa:', data.clientName],
    ['Correo Electrónico:', data.clientEmail],
    ['Teléfono:', data.clientPhone || 'No indicado'],
    ['Servicio Solicitado:', data.service || 'Servicios de Ingeniería Civil'],
    [],

    // Bloque 4: Cabecera de la tabla de partidas
    ['#', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD', 'V. UNITARIO (COP)', 'SUBTOTAL (COP)'],

    // Bloque 5: Partidas de obra (filas dinámicas)
    ...data.items.map((item, i) => [
      i + 1,
      item.description,
      item.unit,
      item.quantity,
      item.unitPrice,
      item.quantity * item.unitPrice,
    ]),

    // Separador
    [],

    // Bloque 6: Resumen financiero
    ['', '', '', '', 'SUBTOTAL:', data.subtotal],
    ...(data.discount > 0
      ? [['', '', '', '', `DESCUENTO (${data.discount}%):`, -data.discountAmount]]
      : []),
    ...(data.includeIva
      ? [['', '', '', '', 'IVA (19%):', data.ivaAmount]]
      : []),
    ['', '', '', '', 'TOTAL FINAL (COP):', data.total],
    [],

    // Bloque 7: Condiciones comerciales
    ['CONDICIONES COMERCIALES'],
    [`Validez: ${data.validityDays} días calendario desde la fecha de emisión.`],
    [`Forma de pago: ${data.paymentTerms}`],
    ['Los precios incluyen mano de obra, materiales y equipos mencionados en las partidas.'],
    ['Trabajos no contemplados serán objeto de cotización adicional.'],
    ...(data.notes ? [[], ['Observaciones:', data.notes]] : []),
    [],
    ['Elaborado por: Arinsson Cossio Moreno — Representante Legal'],
    ['CONSTRUCTORA ACM 1 S.A.S.  |  "Construimos soluciones sólidas para un futuro mejor"'],
  ];

  // Convertir el arreglo de filas a una hoja de cálculo
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // ── Anchos de columna ────────────────────────────────────────────────────────
  ws['!cols'] = [
    { wch: 6 },   // # 
    { wch: 50 },  // Descripción
    { wch: 12 },  // Unidad
    { wch: 12 },  // Cantidad
    { wch: 20 },  // V. Unitario
    { wch: 22 },  // Subtotal
  ];

  // Agregar la hoja al libro con nombre descriptivo
  XLSX.utils.book_append_sheet(wb, ws, `Cotización ${data.quoteNumber}`);

  // Descargar el archivo
  XLSX.writeFile(wb, `Cotizacion_ACM1_${data.quoteNumber}.xlsx`);
}
