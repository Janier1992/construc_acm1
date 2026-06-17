/**
 * @file Testimonials.tsx
 * @description Sección de Testimonios y Reseñas de Clientes. 
 * Permite visualizar reseñas desde Firestore y enviar nuevas calificaciones incluyendo 
 * subida de foto local convertida a base64.
 * @module sections/Testimonials
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, User, ArrowRight, X } from 'lucide-react';
import { insforge } from '../../insforge';

/** Estructura de una reseña obtenida de la base de datos */
interface Review {
  id: string;
  name: string;
  project?: string;
  rating: number;
  comment: string;
  image?: string;
  approved: boolean;
  created_at?: string;
}

export const Testimonials = () => {
  // Estado para la lista de reseñas traídas de Insforge
  const [reviews, setReviews] = useState<Review[]>([]);
  // Índice de la reseña actual mostrada en el carrusel
  const [currentIndex, setCurrentIndex] = useState(0);
  // Visibilidad del formulario modal de nueva calificación
  const [showForm, setShowForm] = useState(false);
  // Datos del formulario de calificación
  const [formData, setFormData] = useState({ name: '', project: '', rating: 5, comment: '', image: '' });
  // Estado del proceso de envío ('idle', 'loading', 'success', 'error')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Efecto para obtener las reseñas cada vez que cambia el estado (ej. tras un envío exitoso)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await insforge.database
          .from('testimonials')
          .select('*')
          .eq('approved', true) // Solo mostrar los aprobados por el administrador
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, [status]);

  // Controles del carrusel de reseñas
  const next = () => reviews.length && setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prev = () => reviews.length && setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  /**
   * Maneja el envío del formulario de reseñas a Insforge.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.comment) return;
    setStatus('loading');
    try {
      // Guardar el testimonio en Insforge (tabla testimonials)
      const { error } = await insforge.database.from('testimonials').insert({
        ...formData,
        approved: false // Requiere moderación manual del administrador
      });

      if (error) throw error;

      setStatus('success');
      // Limpiar formulario
      setFormData({ name: '', project: '', rating: 5, comment: '', image: '' });
      setTimeout(() => { setStatus('idle'); setShowForm(false); }, 3000);
    } catch (err) { 
      console.error(err); 
      setStatus('error'); 
    }
  };

  /**
   * Convierte la imagen local subida a base64 usando FileReader
   * para guardarla temporalmente en Firestore sin requerir Storage.
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen válido.');
        e.target.value = '';
        return;
      }
      // Validar tamaño máximo de 200 KB
      if (file.size > 200 * 1024) {
        alert('La imagen supera el límite permitido de 200 KB. Por favor suba una foto optimizada.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="testimonios" className="bg-[#0D2E5C] py-24 md:py-32 px-6 md:px-12 text-white overflow-hidden" aria-labelledby="testimonials-title">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        
        {/* Cabecera de la Sección */}
        <div className="md:w-1/3">
          <span className="text-brand-green text-[0.7rem] font-black tracking-[0.4em] uppercase block mb-4">Confianza</span>
          <h2 id="testimonials-title" className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-tight mb-8">Nuestros <br /> Clientes Opina</h2>
          <button 
            onClick={() => setShowForm(true)}
            className="border border-brand-green/30 text-brand-green px-8 py-4 text-[0.6rem] font-black tracking-widest uppercase hover:bg-brand-green hover:text-[#0D2E5C] transition-all"
          >
            Calificar Servicio
          </button>
        </div>

        {/* Visor / Carrusel de Reseñas */}
        <div className="md:w-2/3 w-full relative">
          <AnimatePresence mode="wait">
            {reviews.length > 0 ? (
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 border border-white/10 p-10 md:p-14 backdrop-blur-sm"
              >
                <Quote className="text-brand-green w-10 h-10 mb-8 opacity-40" />
                <p className="text-xl md:text-2xl font-serif font-light leading-relaxed italic mb-8">
                  "{reviews[currentIndex].comment}"
                </p>
                <div className="flex items-center justify-between mt-10">
                  <div className="flex items-center gap-4">
                    {/* Renderización Condicional de la Foto de Perfil */}
                    {reviews[currentIndex].image ? (
                      <img src={reviews[currentIndex].image} alt={reviews[currentIndex].name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-green" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center border border-brand-green/30">
                        <User className="text-brand-green w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-lg">{reviews[currentIndex].name}</h4>
                      <p className="text-[0.6rem] uppercase tracking-widest text-brand-green font-bold">{reviews[currentIndex].project || 'Proyecto Obra'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={prev} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowRight className="rotate-180" /></button>
                    <button onClick={next} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowRight /></button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/5 border border-white/10 p-10 text-center">
                <p className="text-slate-400 text-sm uppercase tracking-widest italic">Acompañanos en este recorrido, deja tu comentario.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Formulario Modal para Nueva Reseña */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-[#0D2E5C]/95 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="relative bg-white rounded-3xl w-full max-w-lg p-10 md:p-16 shadow-2xl text-slate-800"
              role="dialog"
              aria-modal="true"
            >
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 text-[#0D2E5C] hover:text-brand-green transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="font-serif text-3xl font-bold text-[#0D2E5C] mb-8 uppercase tracking-tighter">Calificación de Servicio</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Nombre Completo</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border-b border-slate-200 p-4 text-sm text-slate-800 focus:border-brand-green outline-none"
                    placeholder="Escriba su nombre"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Tipo de Proyecto / Obra</label>
                  <input 
                    type="text"
                    value={formData.project}
                    onChange={e => setFormData({...formData, project: e.target.value})}
                    className="w-full bg-slate-50 border-b border-slate-200 p-4 text-sm text-slate-800 focus:border-brand-green outline-none"
                    placeholder="Ej: Excavación en Medellín"
                  />
                </div>

                {/* Subida de Imagen */}
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Su Foto (Opcional)</label>
                  <div className="flex items-center gap-4">
                    {formData.image ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-green shrink-0">
                        <img src={formData.image} alt="Avatar Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 shrink-0">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <label className="cursor-pointer bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-bold uppercase text-[#0D2E5C] hover:bg-brand-green hover:border-brand-green transition-colors">
                      Elegir Imagen
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Calificación por Estrellas */}
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 block mb-2">Puntuación</label>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        type="button"
                        onClick={() => setFormData({...formData, rating: s})}
                        className={`text-3xl transition-transform hover:scale-125 ${formData.rating >= s ? 'text-brand-green' : 'text-slate-200'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Su Comentario</label>
                  <textarea 
                    required
                    value={formData.comment}
                    onChange={e => setFormData({...formData, comment: e.target.value})}
                    className="w-full bg-slate-50 border-b border-slate-200 p-4 text-sm text-slate-800 min-h-[120px] focus:border-brand-green outline-none resize-none"
                    placeholder="Cuéntenos su experiencia con ACM 1..."
                  />
                </div>

                <button 
                  disabled={status === 'loading'}
                  className="w-full bg-[#0D2E5C] text-white py-5 text-[0.7rem] font-black uppercase tracking-widest hover:bg-brand-green hover:text-[#0D2E5C] transition-all"
                >
                  {status === 'loading' ? 'Enviando...' : status === 'success' ? '¡Gracias!' : 'Publicar Calificación'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
