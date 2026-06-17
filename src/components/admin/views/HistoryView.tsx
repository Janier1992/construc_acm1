/**
 * @file HistoryView.tsx
 * @description Vista de historial de cotizaciones generadas.
 * Muestra el listado de documentos guardados en la tabla 'generated_quotes'
 * y permite volver a editarlas o exportarlas.
 * @module admin/views/HistoryView
 */
import React, { useState } from 'react';
import { 
  FileEdit, Search, FileDown, TableProperties, 
  RefreshCw, Trash2, Calendar
} from 'lucide-react';
import { insforge } from '../../../insforge';
import { GeneratedQuote } from '../types';
import { exportQuotePDF } from '../utils/exportPDF';
import { exportQuoteXLSX } from '../utils/exportXLSX';

interface HistoryViewProps {
  quotes: GeneratedQuote[];
  onEdit: (quote: GeneratedQuote) => void;
  onRefresh: () => void;
}

export const HistoryView = ({ quotes, onEdit, onRefresh }: HistoryViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar por número de cotización o nombre del cliente
  const filtered = quotes.filter(q => 
    q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** Mapea un objeto GeneratedQuote a QuoteData para los exportadores */
  const mapToQuoteData = (q: GeneratedQuote) => ({
    quoteNumber: q.quote_number,
    issueDate: q.issue_date,
    validUntil: q.valid_until,
    validityDays: q.validity_days,
    clientName: q.client_name,
    clientEmail: q.client_email,
    clientPhone: q.client_phone,
    service: q.service,
    requestDate: q.request_date,
    items: q.items,
    subtotal: Number(q.subtotal),
    discount: Number(q.discount),
    discountAmount: Number(q.discount_amount),
    includeIva: q.include_iva,
    iva_amount: Number(q.iva_amount), // Corregido el nombre si es necesario
    ivaAmount: Number(q.iva_amount),
    total: Number(q.total),
    paymentTerms: q.payment_terms,
    notes: q.notes
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este registro histórico?')) return;
    try {
      const { error } = await insforge.database.from('generated_quotes').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la cotización.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-black uppercase tracking-widest text-brand-green mb-1">Trazabilidad</p>
          <h2 className="font-serif text-2xl font-bold text-[#0D2E5C] tracking-tighter">Historial de Cotizaciones</h2>
          <p className="text-slate-400 text-xs mt-1">{quotes.length} documentos guardados</p>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0D2E5C] px-4 py-2.5 text-[0.6rem] font-black uppercase tracking-widest transition-colors rounded-xl self-start">
          <RefreshCw size={13} /> Actualizar Listado
        </button>
      </div>

      {/* ── Filtros / Buscador ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          type="text"
          placeholder="Buscar por cliente o número de cotización..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#0D2E5C] outline-none focus:border-brand-green transition-colors"
        />
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#0D2E5C]">
            <tr>
              {['Número', 'Cliente', 'Servicio', 'Total (COP)', 'Fecha', 'Acciones'].map(th => (
                <th key={th} className="px-6 py-4 text-left text-[0.6rem] font-black uppercase tracking-widest text-white/70">{th}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(quote => (
              <tr key={quote.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-[#0D2E5C] bg-slate-100 px-2 py-1 rounded-lg">
                    {quote.quote_number}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-[#0D2E5C]">{quote.client_name}</div>
                  <div className="text-[0.65rem] text-slate-400">{quote.client_email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-600 line-clamp-1 max-w-[200px]">{quote.service}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-[#0D2E5C]">$ {Number(quote.total).toLocaleString('es-CO')}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {quote.issue_date}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(quote)} className="p-2 text-[#0D2E5C] hover:bg-slate-100 rounded-xl transition-colors" title="Editar / Ver Detalle">
                      <FileEdit size={16} />
                    </button>
                    <button onClick={() => exportQuotePDF(mapToQuoteData(quote))} className="p-2 text-brand-green hover:bg-slate-100 rounded-xl transition-colors" title="Exportar PDF">
                      <FileDown size={16} />
                    </button>
                    <button onClick={() => exportQuoteXLSX(mapToQuoteData(quote))} className="p-2 text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors" title="Exportar Excel">
                      <TableProperties size={16} />
                    </button>
                    <button onClick={() => handleDelete(quote.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                  No se encontraron cotizaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
