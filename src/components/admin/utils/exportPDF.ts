/**
 * @file exportPDF.ts
 * @description Utilidad para generar una cotización formal en PDF usando jsPDF + autoTable.
 * Produce un documento con membrete corporativo, tabla de partidas, resumen financiero
 * y condiciones comerciales listo para ser descargado o compartido con el cliente.
 * @module admin/utils/exportPDF
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuoteData } from '../types';

// ─── Paleta corporativa ACM 1 (valores RGB) ─────────────────────────────────
const NAVY   = [13, 46, 92]  as [number,number,number];  // #0D2E5C
const GREEN  = [132, 204, 22] as [number,number,number]; // #84CC16
const WHITE  = [255, 255, 255] as [number,number,number];
const LIGHT  = [244, 246, 249] as [number,number,number];
const GRAY   = [107, 114, 128] as [number,number,number];
const DARK   = [44, 44, 44]   as [number,number,number];

/**
 * Genera y descarga un PDF de cotización con el formato corporativo de ACM 1.
 * @param data - Datos completos de la cotización (cliente, partidas, totales).
 */
export function exportQuotePDF(data: QuoteData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── 1. ENCABEZADO / MEMBRETE ────────────────────────────────────────────────
  // Fondo azul marino superior
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 42, 'F');

  // Banda verde decorativa inferior al encabezado
  doc.setFillColor(...GREEN);
  doc.rect(0, 42, pageW, 2.5, 'F');

  // Nombre de la empresa
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CONSTRUCTORA ACM 1 S.A.S.', 15, 18);

  // Datos corporativos
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 220, 255);
  doc.text('NIT: 901.909.512  |  Medellín, Antioquia  |  Colombia', 15, 25);
  doc.text('Tel: 314 893 8973  |  constructoraacm1@outlook.com', 15, 31);
  doc.text('Carrera 105 # 50-44, Medellín', 15, 37);

  // Número de cotización (derecha del encabezado)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text('COTIZACIÓN N°', pageW - 15, 18, { align: 'right' });
  doc.setFontSize(18);
  doc.setTextColor(...GREEN);
  doc.text(data.quoteNumber, pageW - 15, 27, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setTextColor(200, 220, 255);
  doc.text(`Emisión: ${data.issueDate}`, pageW - 15, 34, { align: 'right' });
  doc.text(`Validez: ${data.validUntil}`, pageW - 15, 39, { align: 'right' });

  // ── 2. DATOS DEL CLIENTE ────────────────────────────────────────────────────
  let y = 52;
  doc.setFillColor(...LIGHT);
  doc.rect(14, y, pageW - 28, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  doc.text('DATOS DEL CLIENTE', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(data.clientName,    18, y + 14);
  doc.text(data.clientEmail,   18, y + 20);
  doc.text(data.clientPhone || 'Sin teléfono', 18, y + 26);
  doc.text(data.service || 'Servicios de Ingeniería Civil', pageW / 2, y + 14);
  doc.text(`Solicitado: ${data.requestDate || data.issueDate}`, pageW / 2, y + 20);

  // ── 3. TABLA DE PARTIDAS ────────────────────────────────────────────────────
  y += 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('RELACIÓN DE PARTIDAS', 14, y);
  y += 4;

  const rows = data.items.map((item, i) => [
    String(i + 1).padStart(2, '0'),
    item.description,
    item.unit,
    item.quantity.toLocaleString('es-CO'),
    `$ ${item.unitPrice.toLocaleString('es-CO')}`,
    `$ ${(item.quantity * item.unitPrice).toLocaleString('es-CO')}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Descripción', 'Unidad', 'Cant.', 'V. Unitario', 'Subtotal']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'right', cellWidth: 18 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 28 },
    },
    alternateRowStyles: { fillColor: LIGHT },
    bodyStyles: { fontSize: 8, textColor: DARK },
    margin: { left: 14, right: 14 },
  });

  // ── 4. RESUMEN FINANCIERO ───────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const boxX = pageW - 90;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text('Subtotal:', boxX, finalY);
  doc.setTextColor(...DARK);
  doc.text(`$ ${data.subtotal.toLocaleString('es-CO')}`, pageW - 14, finalY, { align: 'right' });

  // Descuento (si aplica)
  if (data.discount > 0) {
    doc.setTextColor(...GRAY);
    doc.text(`Descuento (${data.discount}%):`, boxX, finalY + 7);
    doc.setTextColor(220, 38, 38);
    doc.text(`- $ ${data.discountAmount.toLocaleString('es-CO')}`, pageW - 14, finalY + 7, { align: 'right' });
  }

  // IVA (si aplica)
  const ivaOffset = data.discount > 0 ? 14 : 7;
  if (data.includeIva) {
    doc.setTextColor(...GRAY);
    doc.text('IVA (19%):', boxX, finalY + ivaOffset);
    doc.setTextColor(...DARK);
    doc.text(`$ ${data.ivaAmount.toLocaleString('es-CO')}`, pageW - 14, finalY + ivaOffset, { align: 'right' });
  }

  // Línea separadora y TOTAL
  const totalOffset = ivaOffset + (data.includeIva ? 7 : 0);
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.5);
  doc.line(boxX, finalY + totalOffset + 2, pageW - 14, finalY + totalOffset + 2);

  doc.setFillColor(...NAVY);
  doc.rect(boxX - 4, finalY + totalOffset + 4, pageW - boxX + 18 - 14, 11, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text('TOTAL:', boxX, finalY + totalOffset + 12);
  doc.setTextColor(...GREEN);
  doc.text(`$ ${data.total.toLocaleString('es-CO')} COP`, pageW - 14, finalY + totalOffset + 12, { align: 'right' });

  // ── 5. CONDICIONES COMERCIALES ──────────────────────────────────────────────
  const condY = finalY + totalOffset + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('CONDICIONES COMERCIALES', 14, condY);

  const conditions = [
    `• Validez de la oferta: ${data.validityDays} días calendario desde la fecha de emisión.`,
    `• Forma de pago: ${data.paymentTerms}`,
    '• Los precios incluyen mano de obra, materiales y equipos mencionados en las partidas.',
    '• Trabajos no contemplados en esta cotización serán objeto de cotización adicional.',
    '• Tiempo de ejecución estimado según cronograma a convenir con el cliente.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  conditions.forEach((cond, i) => {
    doc.text(cond, 14, condY + 7 + i * 6);
  });

  // Observaciones adicionales
  if (data.notes) {
    doc.setFont('helvetica', 'italic');
    doc.text(`Observaciones: ${data.notes}`, 14, condY + 42);
  }

  // ── 6. PIE DE PÁGINA ────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, pageH - 20, pageW, 20, 'F');
  doc.setFillColor(...GREEN);
  doc.rect(0, pageH - 22, pageW, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text('Arinsson Cossio Moreno — Representante Legal', pageW / 2, pageH - 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(200, 220, 255);
  doc.text('CONSTRUCTORA ACM 1 S.A.S.  |  NIT: 901.909.512  |  "Construimos soluciones sólidas para un futuro mejor"', pageW / 2, pageH - 7, { align: 'center' });

  // Número de página
  doc.setTextColor(...GREEN);
  doc.setFontSize(7);
  doc.text(`Pág. 1 / 1`, pageW - 14, pageH - 7, { align: 'right' });

  // ── 7. DESCARGAR ─────────────────────────────────────────────────────────────
  doc.save(`Cotizacion_ACM1_${data.quoteNumber}.pdf`);
}
