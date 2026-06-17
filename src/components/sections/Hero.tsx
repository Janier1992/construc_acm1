/**
 * @file Hero.tsx
 * @description Sección principal (Hero Banner) de la Landing Page. 
 * Contiene el título principal animado y los botones de llamada a la acción (CTA).
 * @module sections/Hero
 */
import React from 'react';
import { motion } from 'motion/react';
import { Award, ArrowRight } from 'lucide-react';

export const Hero = () => (
  <section className="relative bg-[#020617] min-h-screen flex items-center px-6 md:px-12 overflow-hidden py-32 md:py-24" aria-labelledby="hero-title">
    {/* Fondos decorativos geométricos y desenfocados */}
    <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-green/5 skew-x-12 transform origin-top-right -z-0" aria-hidden="true"></div>
    <div className="absolute -bottom-24 -left-32 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl" aria-hidden="true"></div>

    <div className="max-w-7xl mx-auto w-full relative z-10">
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl"
      >
        {/* Etiquetas superiores de experiencia */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="inline-flex items-center gap-2 bg-brand-green/20 border border-brand-green/30 px-4 py-1.5 rounded-full">
            <Award className="w-4 h-4 text-brand-green" aria-hidden="true" />
            <span className="text-brand-green text-[0.65rem] md:text-[0.75rem] font-black tracking-widest uppercase">
              25+ Años de Experiencia
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-6 md:w-10 bg-slate-500" aria-hidden="true"></div>
            <span className="text-slate-400 text-[0.65rem] md:text-[0.75rem] font-bold tracking-[0.3em] uppercase">
              Cobertura Nacional
            </span>
          </div>
        </div>
        
        {/* Título Principal */}
        <h1 id="hero-title" className="font-serif text-4xl sm:text-6xl md:text-8xl font-extrabold text-white leading-[1.05] mb-8 break-words uppercase">
          Construimos <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-[#fceabb]">
            Soluciones Sólidas
          </span>
        </h1>
        
        {/* Párrafos descriptivos */}
        <div className="space-y-6 mb-12 max-w-2xl border-l-4 border-brand-green pl-6 md:pl-8">
          <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed">
            "Construimos soluciones sólidas para un futuro mejor". Calidad, cumplimiento y compromiso en cada proyecto que ejecutamos.
          </p>
          <p className="text-slate-400 text-sm md:text-base font-light italic leading-relaxed">
            CONSTRUCTORA ACM 1 S.A.S es una empresa especializada en la ejecución de obras civiles con más de 25 años de trayectoria, garantizando calidad y cumplimiento en cada proyecto.
          </p>
        </div>

        {/* Botones de Acción (CTAs) */}
        <div className="flex flex-col sm:flex-row gap-5">
          <a 
            href="#experiencia" 
            className="inline-flex items-center justify-center bg-brand-green text-[#0D2E5C] text-[0.7rem] font-black tracking-widest uppercase px-12 py-6 hover:bg-white transition-all duration-300 group shadow-2xl rounded-2xl focus-visible:ring-4 focus-visible:ring-brand-green/20 outline-none"
          >
            Nuestra Experiencia
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </a>
          <a 
            href="#contáctenos" 
            className="inline-flex items-center justify-center border border-white/20 text-white text-[0.7rem] font-black tracking-widest uppercase px-12 py-6 hover:bg-white/5 transition-all duration-300 rounded-2xl focus-visible:ring-2 focus-visible:ring-brand-green outline-none"
          >
            Contacto Directo
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);
