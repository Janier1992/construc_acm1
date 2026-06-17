/**
 * @file DashboardHome.tsx
 * @description Vista de inicio del panel administrativo.
 * Muestra tarjetas de KPIs (métricas clave) y el resumen del último lead recibido.
 * @module admin/views/DashboardHome
 */
import React from 'react';
import { motion } from 'motion/react';
import { Inbox, Clock, Star, TrendingUp, ArrowRight, FileSearch } from 'lucide-react';
import { Lead, Testimonial, GeneratedQuote } from '../types';

interface DashboardHomeProps {
  leads: Lead[];
  reviews: Testimonial[];
  quotes: GeneratedQuote[];
  onGoToLeads: () => void;
  onGoToQuote: () => void;
  onGoToHistory: () => void;
}

export const DashboardHome = ({ leads, reviews, quotes, onGoToLeads, onGoToQuote, onGoToHistory }: DashboardHomeProps) => {
  const pendingReviews = reviews.filter(r => !r.approved).length;
  const pendingLeads   = leads.filter(l => !l.status || l.status === 'nuevo').length;
  const lastLead       = leads[0];
  const lastQuote      = quotes[0];

  // Tarjetas de métricas
  const kpis = [
    {
      label: 'Total Solicitudes',
      value: leads.length,
      icon: <Inbox className="w-6 h-6" />,
      color: 'bg-[#0D2E5C] text-white',
      iconBg: 'bg-white/10',
    },
    {
      label: 'Nuevas / Sin Atender',
      value: pendingLeads,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-amber-500 text-white',
      iconBg: 'bg-white/20',
    },
    {
      label: 'Cotizaciones Enviadas',
      value: quotes.length,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-emerald-500 text-white',
      iconBg: 'bg-white/20',
    },
    {
      label: 'Testimonios Pendientes',
      value: pendingReviews,
      icon: <Star className="w-6 h-6" />,
      color: 'bg-violet-600 text-white',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <p className="text-[0.6rem] font-black uppercase tracking-widest text-brand-green mb-1">Bienvenido</p>
        <h2 className="font-serif text-3xl font-bold text-[#0D2E5C] tracking-tighter">Panel de Control</h2>
        <p className="text-slate-400 text-sm mt-1">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${kpi.color} rounded-2xl p-5`}
          >
            <div className={`${kpi.iconBg} rounded-xl w-10 h-10 flex items-center justify-center mb-4`}>
              {kpi.icon}
            </div>
            <p className="text-3xl font-black font-serif">{kpi.value}</p>
            <p className="text-[0.6rem] font-bold uppercase tracking-widest opacity-70 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={onGoToLeads}
          className="flex items-center justify-between bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-brand-green rounded-2xl p-6 text-left transition-all group"
        >
          <div>
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-brand-green mb-1">Ver todas</p>
            <p className="font-serif text-xl font-bold text-[#0D2E5C]">Solicitudes Recibidas</p>
            <p className="text-slate-400 text-xs mt-1">{pendingLeads} sin atender</p>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-brand-green transition-colors" />
        </button>

        <button onClick={onGoToQuote}
          className="flex items-center justify-between bg-[#0D2E5C] hover:bg-[#0D2E5C]/90 rounded-2xl p-6 text-left transition-all group"
        >
          <div>
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-brand-green mb-1">Crear nueva</p>
            <p className="font-serif text-xl font-bold text-white">Cotización Formal</p>
            <p className="text-white/40 text-xs mt-1">PDF · XLSX · WhatsApp</p>
          </div>
          <ArrowRight className="text-white/30 group-hover:text-brand-green transition-colors" />
        </button>
      </div>

      {/* Último lead y Última Cotización */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lastLead && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 mb-4">Última Solicitud</p>
              <p className="font-bold text-[#0D2E5C] text-lg">{lastLead.name}</p>
              <p className="text-sm text-slate-500">{lastLead.email}</p>
              <p className="text-xs font-semibold text-[#1A4A8A] bg-blue-50 px-2 py-1 rounded-lg inline-block mt-2">
                {lastLead.service || 'Servicio no especificado'}
              </p>
            </div>
            <button onClick={onGoToLeads}
              className="mt-6 flex items-center justify-center gap-2 bg-[#0D2E5C] text-white hover:bg-brand-green hover:text-[#0D2E5C] px-4 py-2.5 text-[0.6rem] font-black uppercase tracking-widest rounded-xl transition-all w-full"
            >
              Ver Solicitudes <ArrowRight size={12} />
            </button>
          </div>
        )}

        {lastQuote && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col justify-between shadow-sm">
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 mb-4">Última Cotización</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#0D2E5C] text-lg">{lastQuote.quote_number}</p>
                <p className="font-black text-brand-green text-sm">$ {Number(lastQuote.total).toLocaleString('es-CO')}</p>
              </div>
              <p className="text-sm text-slate-500 mt-1">{lastQuote.client_name}</p>
              <p className="text-[0.6rem] uppercase font-bold text-slate-400 mt-2">{lastQuote.issue_date}</p>
            </div>
            <button onClick={onGoToHistory}
              className="mt-6 flex items-center justify-center gap-2 bg-slate-100 text-[#0D2E5C] hover:bg-slate-200 px-4 py-2.5 text-[0.6rem] font-black uppercase tracking-widest rounded-xl transition-all w-full"
            >
              Ver Historial <FileSearch size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
