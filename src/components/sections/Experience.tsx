/**
 * @file Experience.tsx
 * @description Sección de Portafolio / Experiencia de la empresa.
 * Renderiza tarjetas de servicios que, al ser clickeadas, abren un modal detallado.
 * @module sections/Experience
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Warehouse, LayoutGrid, Building2, ArrowRight, X } from 'lucide-react';

// Importación de imágenes locales del portafolio
import imgPilas from '../../assets/images/escabacionpilas.webp';
import imgMuros from '../../assets/images/construccionmuros.webp';
import imgPlacaHuellas from '../../assets/images/construccionplacahuellas.webp';
import imgEstructura from '../../assets/images/construccionestructura.webp';

/** Elemento del portafolio de servicios */
interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  desc: string;
  detailedDesc: string;
  icon: React.ReactNode;
}

export const Experience = () => {
  // Estado para manejar qué servicio se encuentra activo en el modal. null significa cerrado.
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Arreglo de servicios disponibles con su descripción e imagen correspondiente
  const portfolio = [
    { 
      id: '01', 
      title: 'Excavación de Pilas', 
      category: 'Cimentación',
      image: imgPilas,
      desc: 'Excavaciones manuales para pilas profundas.',
      detailedDesc: 'Realizamos excavaciones manuales para la construcción de pilas profundas en diferentes tipos de terreno, garantizando estabilidad y cumplimiento técnico.',
      icon: <Search className="w-5 h-5" /> 
    },
    { 
      id: '02', 
      title: 'Construcción de Muros', 
      category: 'Muros',
      image: imgMuros,
      desc: 'Muros en concreto y mampostería estructural.',
      detailedDesc: 'Ejecutamos muros en concreto y mampostería estructural, cumpliendo con las especificaciones del diseño y necesidades de cada proyecto.',
      icon: <Warehouse className="w-5 h-5" /> 
    },
    { 
      id: '03', 
      title: 'Construcción de Placa Huellas', 
      category: 'Vías',
      image: imgPlacaHuellas,
      desc: 'Construcción de placa huellas en concreto.',
      detailedDesc: 'Construimos placa huellas en concreto para vías rurales y urbanas, brindando resistencia, durabilidad y un acabado de calidad.',
      icon: <LayoutGrid className="w-5 h-5" /> 
    },
    { 
      id: '04', 
      title: 'Construcción de Estructura', 
      category: 'Edificación',
      image: imgEstructura,
      desc: 'Estructuras en concreto reforzado.',
      detailedDesc: 'Desarrollamos estructuras en concreto reforzado para edificaciones, asegurando solidez, seguridad y cumplimiento de la normativa vigente.',
      icon: <Building2 className="w-5 h-5" /> 
    }
  ];

  return (
    <section id="experiencia" className="py-24 md:py-32 px-6 md:px-12 bg-white" aria-labelledby="exp-title">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="block text-[0.7rem] font-black tracking-[0.4em] uppercase text-brand-green mb-4">Portafolio</span>
          <h2 id="exp-title" className="font-serif text-4xl md:text-5xl font-bold text-[#0D2E5C] leading-none uppercase tracking-tighter mb-6">Nuestra Experiencia</h2>
          <p className="text-slate-500 font-light leading-relaxed">
            Unificamos nuestros servicios técnicos y proyectos ejecutados para ofrecer una visión clara de nuestras capacidades en ingeniería civil.
          </p>
        </div>

        {/* Rejilla de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolio.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setSelectedItem(item)}
              className="group bg-slate-50 p-8 rounded-2xl hover:bg-[#0D2E5C] transition-all duration-500 cursor-pointer border border-transparent hover:border-brand-green shadow-sm hover:shadow-2xl overflow-hidden"
            >
              <div className="w-12 h-12 bg-white text-[#0D2E5C] rounded-xl flex items-center justify-center mb-10 shadow-sm group-hover:bg-brand-green transition-colors">
                {item.icon}
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-brand-green mb-4 block">{item.category}</span>
              <h3 className="font-serif text-xl font-bold text-[#0D2E5C] group-hover:text-white mb-4 leading-tight uppercase tracking-tight transition-colors">{item.title}</h3>
              <p className="text-slate-400 group-hover:text-slate-300 text-xs font-light leading-relaxed mb-6 transition-colors">{item.desc}</p>
              <div className="flex items-center gap-2 text-brand-green text-[0.6rem] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                Ver Detalles <ArrowRight size={12} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Interactivo de Detalles */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            {/* Overlay oscuro para cerrar el modal al hacer click */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-[#0D2E5C]/95 backdrop-blur-md"
            ></motion.div>

            {/* Contenedor del Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Botón de Cierre */}
              <button 
                onClick={() => setSelectedItem(null)} 
                className="absolute top-6 right-6 z-20 text-white md:text-[#0D2E5C] hover:text-brand-green bg-[#0D2E5C]/20 md:bg-transparent rounded-full p-2 transition-colors"
              >
                <X size={28} />
              </button>
              
              {/* Imagen del Servicio */}
              <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden bg-slate-200">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title} 
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                />
              </div>

              {/* Información Detallada del Servicio */}
              <div className="w-full md:w-1/2 p-10 md:p-16 overflow-y-auto">
                <span className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-brand-green mb-4 block">{selectedItem.category}</span>
                <h3 className="font-serif text-4xl font-bold text-[#0D2E5C] mb-8 uppercase tracking-tighter leading-none">{selectedItem.title}</h3>
                <p className="text-slate-500 text-lg font-light leading-relaxed mb-10">{selectedItem.detailedDesc}</p>
                <button 
                  onClick={() => { setSelectedItem(null); window.location.href = '#contáctenos'; }}
                  className="w-full bg-[#0D2E5C] text-white py-6 rounded-2xl text-[0.7rem] font-black uppercase tracking-[0.4em] hover:bg-brand-green hover:text-[#0D2E5C] transition-all flex items-center justify-center gap-4 shadow-xl"
                >
                  Cotizar Proyecto <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
