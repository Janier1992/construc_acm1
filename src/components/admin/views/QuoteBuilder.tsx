/**
 * @file QuoteBuilder.tsx
 * @description Generador de cotizaciones formales. Permite al administrador construir
 * una cotización con partidas de obra, calcular totales y exportar en PDF o XLSX.
 * @module admin/views/QuoteBuilder
 */
import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Trash2, FileDown, TableProperties, MessageCircle,
  ChevronLeft, Save, AlertCircle
} from 'lucide-react';
import { insforge } from '../../../insforge';
import { QuoteItem, QuoteData, Lead, GeneratedQuote } from '../types';
import { exportQuotePDF } from '../utils/exportPDF';
import { exportQuoteXLSX } from '../utils/exportXLSX';

interface QuoteBuilderProps {
  /** Lead pre-cargado desde la vista de solicitudes (puede ser null para cotización manual) */
  prefillLead?: Lead | null;
  /** Cotización ya existente para editar */
  prefillQuote?: GeneratedQuote | null;
  /** Callback para regresar a la vista anterior */
  onBack: () => void;
}

// ── Fila vacía por defecto ────────────────────────────────────────────────────
const emptyItem = (): QuoteItem => ({ description: '', unit: 'ML', quantity: 1, unitPrice: 0 });

// ── Generador de número de cotización ────────────────────────────────────────
const generateQuoteNumber = (): string => {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `ACM-${year}-${rand}`;
};

// ── Formatear fecha a dd/mm/yyyy ──────────────────────────────────────────────
const formatDate = (date: Date): string =>
  date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const QuoteBuilder = ({ prefillLead, prefillQuote, onBack }: QuoteBuilderProps) => {
  const today = new Date();
  const validUntilDate = new Date(today);
  validUntilDate.setDate(validUntilDate.getDate() + 30);

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [quoteNumber]   = useState(prefillQuote?.quote_number || generateQuoteNumber());
  const [clientName,  setClientName]  = useState(prefillQuote?.client_name  || prefillLead?.name  || '');
  const [clientEmail, setClientEmail] = useState(prefillQuote?.client_email || prefillLead?.email || '');
  const [clientPhone, setClientPhone] = useState(prefillQuote?.client_phone || prefillLead?.phone || '');
  const [service,     setService]     = useState(prefillQuote?.service      || prefillLead?.service || '');
  const [validityDays, setValidityDays] = useState(prefillQuote?.validity_days || 30);
  const [paymentTerms, setPaymentTerms] = useState(prefillQuote?.payment_terms || '50% anticipo al inicio de obra, 50% contra entrega y aprobación del cliente.');
  const [notes, setNotes] = useState(prefillQuote?.notes || prefillLead?.message || '');

  // ── Partidas de obra ───────────────────────────────────────────────────────
  const [items, setItems] = useState<QuoteItem[]>(prefillQuote?.items || [emptyItem()]);

  // ── Configuración financiera ───────────────────────────────────────────────
  const [discount,   setDiscount]   = useState(prefillQuote?.discount || 0);
  const [includeIva, setIncludeIva] = useState(prefillQuote?.include_iva || false);

  // ── Estado de guardado ─────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // ── Cálculos automáticos ───────────────────────────────────────────────────
  const subtotal       = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const discountAmount = subtotal * (discount / 100);
  const baseAfterDisc  = subtotal - discountAmount;
  const ivaAmount      = includeIva ? baseAfterDisc * 0.19 : 0;
  const total          = baseAfterDisc + ivaAmount;

  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + validityDays);

  // ── Helpers para partidas ──────────────────────────────────────────────────
  const updateItem = useCallback((idx: number, field: keyof QuoteItem, value: string | number) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }, []);

  const addItem    = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  // ── Construir el objeto QuoteData ──────────────────────────────────────────
  const buildQuoteData = (): QuoteData => ({
    quoteNumber,
    issueDate:    formatDate(today),
    validUntil:   formatDate(validUntil),
    validityDays,
    clientName,
    clientEmail,
    clientPhone,
    service,
    requestDate: prefillLead?.created_at
      ? formatDate(new Date(prefillLead.created_at))
      : undefined,
    items,
    subtotal,
    discount,
    discountAmount,
    includeIva,
    ivaAmount,
    total,
    paymentTerms,
    notes,
  });

  // ── Guardar en Insforge (PostgreSQL) ──────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const data = buildQuoteData();
      
      // Mapear campos para PostgreSQL (snake_case si es necesario, 
      // pero el esquema que creé usa snake_case: quote_number, client_name, etc.)
      const pgData = {
        quote_number:    data.quoteNumber,
        issue_date:      data.issueDate,
        valid_until:     data.validUntil,
        validity_days:   data.validityDays,
        client_name:     data.clientName,
        client_email:    data.clientEmail,
        client_phone:    data.clientPhone,
        service:         data.service,
        request_date:    data.requestDate,
        items:           data.items,
        subtotal:        data.subtotal,
        discount:        data.discount,
        discount_amount: data.discountAmount,
        include_iva:     data.includeIva,
        iva_amount:      data.ivaAmount,
        total:           data.total,
        payment_terms:   data.paymentTerms,
        notes:           data.notes,
        lead_id:         prefillLead?.id || null
      };

      const { error: quoteError } = await insforge.database
        .from('generated_quotes')
        .upsert({
          ...(prefillQuote?.id ? { id: prefillQuote.id } : {}),
          ...pgData
        });

      if (quoteError) throw quoteError;

      // Si viene de un lead, marcar como cotizado en la tabla 'quotes'
      if (prefillLead?.id) {
        const { error: leadError } = await insforge.database
          .from('quotes')
          .update({ status: 'cotizado' })
          .eq('id', prefillLead.id);
        
        if (leadError) throw leadError;
      }


      setSaved(true);

      // Limpiar el formulario después de un breve delay si es una cotización nueva
      // (Si es edición, quizás el usuario quiera seguir editando, pero el requerimiento
      // pide que se eliminen los datos y quede en cero).
      setTimeout(() => {
        setClientName('');
        setClientEmail('');
        setClientPhone('');
        setService('');
        setItems([emptyItem()]);
        setDiscount(0);
        setIncludeIva(false);
        setNotes('');
        setSaved(false);
      }, 2000);

    } catch (err) {
      console.error('Error al guardar la cotización:', err);
      alert('Error al guardar la cotización en la base de datos.');
    }
    setSaving(false);
  };

  // ── Exportar PDF ───────────────────────────────────────────────────────────
  const handleExportPDF = () => exportQuotePDF(buildQuoteData());

  // ── Exportar XLSX ──────────────────────────────────────────────────────────
  const handleExportXLSX = () => exportQuoteXLSX(buildQuoteData());

  // ── Enviar por WhatsApp ────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `*Cotización ${quoteNumber} — Constructora ACM 1 S.A.S.*\n\n` +
      `Cliente: ${clientName}\n` +
      `Servicio: ${service || 'Servicios Civiles'}\n\n` +
      `*Total: $ ${total.toLocaleString('es-CO')} COP*\n` +
      `Válida hasta: ${formatDate(validUntil)}\n\n` +
      `Para más información: constructoraacm1@outlook.com | Tel: 314 893 8973`
    );
    window.open(`https://wa.me/573147490844?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* ── Barra superior ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#0D2E5C]" />
          </button>
          <div>
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-brand-green mb-0.5">
              {prefillQuote ? 'Editando Cotización' : 'Nueva Cotización'}
            </p>
            <h2 className="font-serif text-2xl font-bold text-[#0D2E5C] tracking-tighter">{quoteNumber}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0D2E5C] px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-widest transition-colors rounded-xl">
            <Save size={14} /> {saving ? 'Guardando...' : saved ? '✓ Guardada' : 'Guardar'}
          </button>
          <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-widest transition-colors rounded-xl">
            <TableProperties size={14} /> Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-[#0D2E5C] hover:bg-brand-green hover:text-[#0D2E5C] text-white px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-widest transition-colors rounded-xl">
            <FileDown size={14} /> PDF
          </button>
          <button onClick={handleWhatsApp} className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-widest transition-colors rounded-xl">
            <MessageCircle size={14} /> WhatsApp
          </button>
        </div>
      </div>

      {/* ── Datos del Cliente ── */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-[#0D2E5C] mb-6">Datos del Cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: 'Nombre / Empresa', value: clientName, setter: setClientName, type: 'text', placeholder: 'Empresa Constructora S.A.S.' },
            { label: 'Correo Electrónico', value: clientEmail, setter: setClientEmail, type: 'email', placeholder: 'contacto@empresa.com' },
            { label: 'Teléfono', value: clientPhone, setter: setClientPhone, type: 'tel', placeholder: '300 123 4567' },
          ].map(f => (
            <div key={f.label} className="space-y-1.5">
              <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">{f.label}</label>
              <input type={f.type} value={f.value} placeholder={f.placeholder}
                onChange={e => f.setter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0D2E5C] focus:border-brand-green outline-none transition-colors"
              />
            </div>
          ))}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Servicio / Descripción del Proyecto</label>
            <input type="text" value={service} placeholder="Excavación de pilas, Construcción de muros..."
              onChange={e => setService(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0D2E5C] focus:border-brand-green outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Validez (días)</label>
            <input type="number" value={validityDays} min={1} max={180}
              onChange={e => setValidityDays(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0D2E5C] focus:border-brand-green outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Tabla de Partidas ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-[#0D2E5C]">Partidas de Obra</h3>
          <button onClick={addItem} className="flex items-center gap-2 bg-brand-green text-[#0D2E5C] px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest hover:bg-[#0D2E5C] hover:text-white transition-all rounded-xl">
            <Plus size={13} /> Agregar Partida
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#0D2E5C] text-white">
              <tr>
                {['#', 'Descripción', 'Unidad', 'Cantidad', 'V. Unitario (COP)', 'Subtotal (COP)', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[0.6rem] font-black uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-400 font-bold">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-2 py-2">
                    <input value={item.description} placeholder="Descripción del trabajo..."
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      className="w-full min-w-[200px] bg-transparent border-b border-slate-200 py-1 text-sm text-[#0D2E5C] focus:border-brand-green outline-none"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                      className="bg-transparent border-b border-slate-200 py-1 text-sm text-[#0D2E5C] focus:border-brand-green outline-none"
                    >
                      {['ML', 'M2', 'M3', 'Und', 'Global', 'Kg', 'Ton', 'Día', 'Mes'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" min={0} value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                      className="w-20 bg-transparent border-b border-slate-200 py-1 text-sm text-right text-[#0D2E5C] focus:border-brand-green outline-none"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" min={0} value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))}
                      className="w-32 bg-transparent border-b border-slate-200 py-1 text-sm text-right text-[#0D2E5C] focus:border-brand-green outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#0D2E5C] text-right whitespace-nowrap">
                    $ {(item.quantity * item.unitPrice).toLocaleString('es-CO')}
                  </td>
                  <td className="px-2 py-2">
                    <button onClick={() => removeItem(i)} disabled={items.length === 1}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Resumen Financiero ── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Condiciones */}
        <div className="flex-1 space-y-5 bg-slate-50 rounded-2xl p-6">
          <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-[#0D2E5C]">Condiciones Comerciales</h3>
          <div className="space-y-1.5">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Forma de Pago</label>
            <textarea value={paymentTerms} rows={3}
              onChange={e => setPaymentTerms(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0D2E5C] focus:border-brand-green outline-none resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Observaciones / Notas</label>
            <textarea value={notes} rows={3} placeholder="Observaciones adicionales para el cliente..."
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0D2E5C] focus:border-brand-green outline-none resize-none"
            />
          </div>
        </div>

        {/* Totales */}
        <div className="w-full lg:w-80 bg-[#0D2E5C] text-white rounded-2xl p-6 space-y-4">
          <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-brand-green">Resumen Financiero</h3>

          <div className="space-y-3 divide-y divide-white/10">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-white/60">Subtotal</span>
              <span className="font-bold">$ {subtotal.toLocaleString('es-CO')}</span>
            </div>

            {/* Descuento */}
            <div className="py-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Descuento (%)</span>
                <input type="number" min={0} max={100} value={discount}
                  onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-right text-white focus:border-brand-green outline-none"
                />
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-300">
                  <span>- Descuento</span>
                  <span>- $ {discountAmount.toLocaleString('es-CO')}</span>
                </div>
              )}
            </div>

            {/* IVA */}
            <div className="py-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">IVA (19%)</span>
                <button onClick={() => setIncludeIva(!includeIva)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${includeIva ? 'bg-brand-green' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${includeIva ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              {includeIva && (
                <div className="flex justify-between text-sm text-white/70">
                  <span>IVA</span>
                  <span>$ {ivaAmount.toLocaleString('es-CO')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-brand-green rounded-xl p-4">
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#0D2E5C] mb-1">Total Final</p>
            <p className="font-serif text-2xl font-black text-[#0D2E5C]">
              $ {total.toLocaleString('es-CO')}
            </p>
            <p className="text-[0.55rem] text-[#0D2E5C]/60 uppercase mt-0.5">Pesos Colombianos (COP)</p>
          </div>

          {/* Aviso si hay partidas vacías */}
          {items.some(it => !it.description || it.unitPrice === 0) && (
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <AlertCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-[0.6rem] text-yellow-400">Hay partidas sin descripción o valor. Complételas antes de exportar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
