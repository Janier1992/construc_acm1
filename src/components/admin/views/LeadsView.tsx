/**
 * @file LeadsView.tsx
 * @description Vista de gestión de solicitudes de cotización (leads).
 * Muestra la tabla de todos los registros de Firestore con su estado y permite
 * iniciar una cotización formal directamente desde cada registro.
 * @module admin/views/LeadsView
 */
import React, { useState } from 'react';
import { FileEdit, RefreshCw, Filter, Trash2 } from 'lucide-react';
import { insforge } from '../../../insforge';
import { Lead } from '../types';

interface LeadsViewProps {
  leads: Lead[];
  onCreateQuote: (lead: Lead) => void;
  onRefresh: () => void;
}

// Colores del badge de estado
const STATUS_STYLE: Record<string, string> = {
  nuevo:    'bg-sky-100 text-sky-700 border-sky-200',
  cotizado: 'bg-amber-100 text-amber-700 border-amber-200',
  cerrado:  'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const LeadsView = ({ leads, onCreateQuote, onRefresh }: LeadsViewProps) => {
  const [filterService, setFilterService] = useState('');
  const [filterStatus, setFilterStatus]   = useState('');

  // Servicios únicos para el filtro
  const services = Array.from(new Set(leads.map(l => l.service).filter(Boolean)));

  // Aplicar filtros
  const filtered = leads.filter(l => {
    const matchService = !filterService || l.service === filterService;
    const matchStatus  = !filterStatus  || (l.status || 'nuevo') === filterStatus;
    return matchService && matchStatus;
  });

  /** Actualiza el estado de un lead directamente en Insforge */
  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const { error } = await insforge.database
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar el estado del lead.');
    }
  };

  /** Elimina un lead de la base de datos */
  const deleteLead = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.')) return;
    try {
      const { error } = await insforge.database
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error('Error al eliminar lead:', err);
      alert('No se pudo eliminar el registro.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-black uppercase tracking-widest text-brand-green mb-1">Gestión</p>
          <h2 className="font-serif text-2xl font-bold text-[#0D2E5C] tracking-tighter">Solicitudes de Cotización</h2>
          <p className="text-slate-400 text-xs mt-1">{leads.length} registros en total · {filtered.length} mostrados</p>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0D2E5C] px-4 py-2.5 text-[0.6rem] font-black uppercase tracking-widest transition-colors rounded-xl self-start">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 rounded-2xl">
        <Filter size={14} className="text-slate-400" />
        <select value={filterService} onChange={e => setFilterService(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0D2E5C] focus:border-brand-green outline-none"
        >
          <option value="">Todos los servicios</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0D2E5C] focus:border-brand-green outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="nuevo">Nuevo</option>
          <option value="cotizado">Cotizado</option>
          <option value="cerrado">Cerrado</option>
        </select>
        {(filterService || filterStatus) && (
          <button onClick={() => { setFilterService(''); setFilterStatus(''); }}
            className="text-xs text-slate-400 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#0D2E5C]">
            <tr>
              {['Fecha', 'Cliente / Empresa', 'Servicio Solicitado', 'Contacto', 'Estado', 'Acciones'].map(th => (
                <th key={th} className="px-4 py-4 text-left text-[0.6rem] font-black uppercase tracking-widest text-white/70">{th}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(lead => {
              const status = lead.status || 'nuevo';
              return (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                  {/* Fecha */}
                  <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {lead.created_at
                      ? new Date(lead.created_at).toLocaleDateString('es-CO')
                      : '—'}
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-4">
                    <div className="font-bold text-sm text-[#0D2E5C]">{lead.name}</div>
                    {lead.message && (
                      <div className="text-[0.65rem] text-slate-400 italic mt-0.5 line-clamp-1 group-hover:line-clamp-none">{lead.message}</div>
                    )}
                  </td>

                  {/* Servicio */}
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-[#1A4A8A] bg-blue-50 px-2 py-1 rounded-lg">
                      {lead.service || 'No especificado'}
                    </span>
                  </td>

                  {/* Contacto */}
                  <td className="px-4 py-4 text-xs text-[#0D2E5C] space-y-0.5">
                    <div>{lead.email}</div>
                    <div className="text-slate-400">{lead.phone || '—'}</div>
                  </td>

                  {/* Estado (selector inline) */}
                  <td className="px-4 py-4">
                    <select
                      value={status}
                      onChange={e => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                      className={`text-[0.6rem] font-black uppercase tracking-widest border rounded-lg px-2 py-1 outline-none cursor-pointer transition-colors ${STATUS_STYLE[status]}`}
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="cotizado">Cotizado</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </td>

                  {/* Acción: Generar Cotización */}
                   <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCreateQuote(lead)}
                        className="flex items-center gap-1.5 bg-[#0D2E5C] text-white hover:bg-brand-green hover:text-[#0D2E5C] px-3 py-2 text-[0.6rem] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap"
                      >
                        <FileEdit size={12} /> Cotizar
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Eliminar solicitud"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-slate-400 text-sm italic">
                  No hay solicitudes que coincidan con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
