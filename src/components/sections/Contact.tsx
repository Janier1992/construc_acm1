/**
 * @file Contact.tsx
 * @description Sección de Contacto Directo. Contiene la información de contacto corporativa
 * y un formulario para enviar cotizaciones o mensajes directamente a Insforge (PostgreSQL).
 * @module sections/Contact
 */
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, User, ArrowRight } from 'lucide-react';
import { insforge } from '../../insforge';

export const Contact = () => {
  // Estado para capturar los datos del formulario de contacto
  const [formData, setFormData] = useState({
    name: '',
    phone: '', // No usado actualmente en el UI pero reservado en el estado
    email: '',
    service: '',
    message: '',
    hp_field: '' // Honeypot field for bot protection
  });
  
  // Estado para manejar la interfaz durante el envío a Firebase
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  /**
   * Maneja el envío del formulario, validando campos mínimos y guardando en Firestore
   * dentro de la colección 'quotes'.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot security check: if hidden field is filled, it's a bot
    if (formData.hp_field) {
      console.warn("Bot detected via honeypot.");
      return;
    }

    if (!formData.name || !formData.email) {
      alert('Por favor complete al menos su nombre y correo electrónico.');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await insforge.database.from('quotes').insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        service: formData.service.trim(),
        message: formData.message.trim(),
        status: 'nuevo'
      });
      
      if (error) throw error;
      
      setStatus('success');
      // Limpiar formulario tras éxito
      setFormData({ name: '', phone: '', email: '', service: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error("Error al enviar cotización:", err);
      setStatus('error');
    }
  };

  return (
    <section id="contáctenos" className="bg-white py-20 md:py-32 px-6 md:px-12 border-t border-slate-100" aria-labelledby="contact-section-title">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        
        {/* Columna de Información de Contacto */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div>
            <span className="block text-[0.7rem] font-black tracking-[0.4em] uppercase text-brand-green mb-4">Contacto Directo</span>
            <h2 id="contact-section-title" className="font-serif text-5xl md:text-6xl font-bold text-[#0D2E5C] leading-none mb-8 uppercase tracking-tighter">Iniciemos su <br /> Próxima Obra</h2>
            <p className="text-slate-500 text-lg font-light leading-relaxed max-w-md">Analizamos los requerimientos técnicos de su proyecto a nivel nacional con la experiencia de CONSTRUCTORA ACM 1 S.A.S.</p>
          </div>

          <div className="space-y-0 divide-y divide-slate-100" role="list">
            {[
              { label: 'Correo Corporativo', val: 'constructoraacm1@outlook.com', icon: <Mail className="w-4 h-4" /> },
              { label: 'Ubicación Sede', val: 'Carrera 105 # 50-44, Medellín - Antioquia', icon: <MapPin className="w-4 h-4" /> },
              { label: 'Rep. Legal: Arinsson Cossio', val: '311 362 2172', icon: <User className="w-4 h-4" /> },
              { label: 'Gte. Suplente: Eloy Moreno', val: '314 893 8973', icon: <User className="w-4 h-4" /> }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 md:gap-8 py-8 grow group" role="listitem">
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-[#0D2E5C] group-hover:text-brand-green transition-all text-[#0D2E5C]" aria-hidden="true">{item.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.6rem] uppercase tracking-[0.2em] font-black text-slate-400 mb-1">{item.label}</div>
                  <div className="text-lg md:text-xl font-serif font-bold text-[#0D2E5C] break-all sm:break-words">{item.val}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Columna de Formulario de Cotización */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#0D2E5C] p-10 md:p-20 text-white relative overflow-hidden"
        >
          {/* Efecto de luz de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 blur-[120px] rounded-full" aria-hidden="true"></div>
          
          <h3 className="text-2xl md:text-3xl font-serif font-bold mb-12 tracking-tighter uppercase">Cotización Técnica</h3>
          
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 relative z-10" id="contact-form">
            {/* Honeypot field - Hidden from users */}
            <div className="hidden" aria-hidden="true">
              <input 
                type="text" 
                name="hp_field" 
                tabIndex={-1} 
                autoComplete="off" 
                value={formData.hp_field}
                onChange={e => setFormData({...formData, hp_field: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-3">
                <label htmlFor="form-name" className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-slate-400">Nombre Completo / Empresa</label>
                <input 
                  required
                  id="form-name"
                  type="text" 
                  placeholder="Juan Pérez - Constructora X"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-b border-white/20 p-3 text-sm focus:border-brand-green outline-none transition-colors"
                  aria-required="true"
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="form-email" className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-slate-400">Canal de Contacto</label>
                <input 
                  required
                  id="form-email"
                  type="email" 
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-b border-white/20 p-3 text-sm focus:border-brand-green outline-none transition-colors"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="form-service" className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-slate-400">Tipo de Requerimiento</label>
              <select 
                id="form-service"
                value={formData.service}
                onChange={e => setFormData({...formData, service: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 p-3 text-sm focus:border-brand-green outline-none transition-colors appearance-none"
              >
                <option value="" className="bg-[#0D2E5C] text-white">Seleccionar Área</option>
                <option value="Excavación de Pilas" className="bg-[#0D2E5C] text-white">Excavación de Pilas (Cimentación)</option>
                <option value="Construcción de Muros" className="bg-[#0D2E5C] text-white">Construcción de Muros (Contención)</option>
                <option value="Placa Huellas" className="bg-[#0D2E5C] text-white">Placa Huellas / Vías Rurales</option>
                <option value="Estructura de Concreto" className="bg-[#0D2E5C] text-white">Estructura de Concreto / Edificación</option>
                <option value="Otro Servicio" className="bg-[#0D2E5C] text-white">Otro Servicio Civil</option>
              </select>
            </div>

            <div className="space-y-3">
              <label htmlFor="form-message" className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-slate-400">Detalles Técnicos</label>
              <textarea 
                id="form-message"
                placeholder="Describa el alcance de la obra..."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 p-3 text-sm min-h-[120px] focus:border-brand-green outline-none transition-colors resize-none"
              />
            </div>

            <button 
              disabled={status === 'loading'}
              className="w-full bg-brand-green text-[#0D2E5C] py-5 md:py-6 text-[0.7rem] font-black uppercase tracking-[0.4em] hover:bg-white transition-all disabled:opacity-50 inline-flex items-center justify-center gap-4 focus-visible:ring-4 focus-visible:ring-white/20 outline-none"
            >
              {status === 'loading' ? 'Transmitiendo...' : 'Enviar Solicitud'}
              <ArrowRight size={20} aria-hidden="true" />
            </button>

            {/* Mensaje de Confirmación */}
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-6 text-[#C9A85C] text-[0.6rem] md:text-xs font-bold uppercase tracking-wider italic text-center"
              >
                Éxito: Solicitud ingresada en el sistema.
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};
