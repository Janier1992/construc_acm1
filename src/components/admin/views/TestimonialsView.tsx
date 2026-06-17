/**
 * @file TestimonialsView.tsx
 * @description Vista de moderación de testimonios de clientes.
 * Permite al administrador aprobar o rechazar los comentarios antes de que
 * aparezcan publicados en la Landing Page.
 * @module admin/views/TestimonialsView
 */
import React, { useState } from 'react';
import { Check, X, User, RefreshCw, Trash2 } from 'lucide-react';
import { insforge } from '../../../insforge';
import { Testimonial } from '../types';

interface TestimonialsViewProps {
  reviews: Testimonial[];
  onRefresh: () => void;
}

export const TestimonialsView = ({ reviews, onRefresh }: TestimonialsViewProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const filtered = reviews.filter(r => {
    if (filter === 'pending')  return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  /** Actualiza el campo `approved` del testimonio en Insforge */
  const handleApproval = async (id: string, approved: boolean) => {
    try {
      const { error } = await insforge.database
        .from('testimonials')
        .update({ approved })
        .eq('id', id);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error('Error al moderar testimonio:', err);
      alert('Error al actualizar el estado del testimonio.');
    }
  };

  /** Elimina un testimonio de la base de datos */
  const deleteReview = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este testimonio? Esta acción no se puede deshacer.')) return;
    try {
      const { error } = await insforge.database
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error('Error al eliminar testimonio:', err);
      alert('No se pudo eliminar el registro.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-black uppercase tracking-widest text-brand-green mb-1">Moderación</p>
          <h2 className="font-serif text-2xl font-bold text-[#0D2E5C] tracking-tighter">Testimonios de Clientes</h2>
          <p className="text-slate-400 text-xs mt-1">
            {reviews.filter(r => !r.approved).length} pendientes · {reviews.filter(r => r.approved).length} aprobados
          </p>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0D2E5C] px-4 py-2.5 text-[0.6rem] font-black uppercase tracking-widest transition-colors rounded-xl self-start">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest rounded-xl transition-all ${
              filter === f ? 'bg-[#0D2E5C] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Aprobados'}
          </button>
        ))}
      </div>

      {/* ── Tarjetas de Testimonios ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(review => (
          <div key={review.id} className={`bg-white border-2 rounded-2xl p-6 transition-all shadow-sm ${
            review.approved ? 'border-emerald-200' : 'border-slate-100'
          }`}>
            {/* Cabecera de la tarjeta */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {review.image ? (
                  <img src={review.image} alt={review.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-green shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-[#0D2E5C]">{review.name}</p>
                  {review.project && (
                    <p className="text-[0.6rem] uppercase tracking-wider font-bold text-brand-green">{review.project}</p>
                  )}
                </div>
              </div>

              {/* Badge de estado */}
              <span className={`text-[0.55rem] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 ${
                review.approved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {review.approved ? 'Aprobado' : 'Pendiente'}
              </span>
            </div>

            {/* Calificación */}
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, s) => (
                <span key={s} className={s < review.rating ? 'text-brand-green' : 'text-slate-200'}>★</span>
              ))}
              <span className="text-xs text-slate-400 ml-2">{review.rating}/5</span>
            </div>

            {/* Comentario */}
            <p className="text-sm text-slate-600 italic leading-relaxed mb-5">"{review.comment}"</p>

            {/* Fecha */}
            <p className="text-[0.6rem] text-slate-300 uppercase tracking-wider mb-4">
              {review.created_at
                ? new Date(review.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </p>

            {/* Botones de acción */}
            <div className="flex gap-2">
              {!review.approved ? (
                <button onClick={() => handleApproval(review.id, true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-colors"
                >
                  <Check size={13} /> Aprobar
                </button>
              ) : (
                <button onClick={() => handleApproval(review.id, false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-500 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-colors"
                >
                  <X size={13} /> Desaprobar
                </button>
              )}
              <button onClick={() => deleteReview(review.id)}
                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border-2 border-transparent hover:border-red-100"
                title="Eliminar testimonio"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-400">
            <p className="text-sm italic">No hay testimonios en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
};
