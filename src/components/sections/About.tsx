/**
 * @file About.tsx
 * @description Sección "Quiénes Somos" / Identidad Corporativa.
 * Muestra información sobre la empresa, los valores de calidad, cumplimiento y seguridad.
 * @module sections/About
 */
import React from 'react';
import { motion } from 'motion/react';
import { Users, Award, Clock, ShieldCheck } from 'lucide-react';

export const About = () => (
  <section id="nosotros" className="py-24 md:py-32 px-6 md:px-12 bg-[#F8FAFC]" aria-labelledby="about-title">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      {/* Columna de Texto Descriptivo */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <span className="block text-[0.7rem] font-black tracking-[0.4em] uppercase text-brand-green mb-4">Quiénes Somos</span>
        <h2 id="about-title" className="font-serif text-4xl md:text-5xl font-bold text-[#0D2E5C] leading-none uppercase tracking-tighter mb-6">Nuestra Identidad Corporativa</h2>
        <div className="space-y-6 text-slate-600 text-lg font-light leading-relaxed mb-8">
          <p>
            <strong className="font-bold text-[#0D2E5C]">CONSTRUCTORA ACM 1 S.A.S</strong> es una empresa especializada en la ejecución de obras civiles con amplia experiencia en excavaciones, cimentaciones, estructuras en concreto y obras complementarias.
          </p>
          <p>
            Contamos con personal altamente calificado y comprometido con la calidad, seguridad y cumplimiento de los tiempos establecidos, garantizando resultados confiables y duraderos en cada proyecto a nivel nacional.
          </p>
        </div>
        
        {/* Etiqueta de Equipo */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
          <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
            <Users className="text-brand-green w-8 h-8" />
          </div>
          <div>
            <div className="text-[#0D2E5C] font-bold font-serif text-xl">Equipo Calificado</div>
            <div className="text-slate-400 text-sm">Expertos en ingeniería civil</div>
          </div>
        </div>
      </motion.div>

      {/* Columna de Tarjetas de Valores */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-brand-green transition-colors sm:col-span-2">
          <Award className="w-10 h-10 text-brand-green mb-4" />
          <h3 className="font-serif text-2xl font-bold text-[#0D2E5C] mb-2">Calidad</h3>
          <p className="text-slate-500 font-light">Trabajamos con altos estándares de calidad en cada proceso, asegurando la excelencia y durabilidad de nuestras obras.</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-brand-green transition-colors">
          <Clock className="w-10 h-10 text-brand-green mb-4" />
          <h3 className="font-serif text-xl font-bold text-[#0D2E5C] mb-2">Cumplimiento</h3>
          <p className="text-slate-500 font-light text-sm">Entregamos proyectos en los tiempos acordados rigurosamente.</p>
        </div>
        
        <div className="bg-[#0D2E5C] p-8 rounded-2xl shadow-xl shadow-[#0D2E5C]/20 border border-transparent">
          <ShieldCheck className="w-10 h-10 text-brand-green mb-4" />
          <h3 className="font-serif text-xl font-bold text-white mb-2">Seguridad</h3>
          <p className="text-white/70 font-light text-sm">Cumplimos estrictamente con las normas de seguridad industrial en la obra.</p>
        </div>
      </motion.div>

    </div>
  </section>
);
