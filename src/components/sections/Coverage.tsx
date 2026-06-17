/**
 * @file Coverage.tsx
 * @description Sección de clientes (Firmas Constructoras). Utiliza Framer Motion para crear un 
 * carrusel infinito (Marquee) dinámico de izquierda a derecha.
 * @module sections/Coverage
 */
import React from 'react';
import { motion } from 'motion/react';

// Imágenes de clientes
import logoIngenieria from '../../assets/images/Ingenieriasas.png';
import logoArqConcreto from '../../assets/images/arquitecturayconcreto.jfif';
import logoColpatria from '../../assets/images/colpatria.jfif';
import logoConstInversiones from '../../assets/images/constructoraeinversiones.jfif';
import logoFertecnicas from '../../assets/images/fertecnicas.jfif';
import logoMensula from '../../assets/images/mensula.png';

export const Coverage = () => {
  // Array estático de logotipos importados localmente
  const logos = [logoIngenieria, logoArqConcreto, logoColpatria, logoConstInversiones, logoFertecnicas, logoMensula];
  
  return (
    <section className="bg-slate-50 py-16 overflow-hidden relative border-t border-slate-200" aria-labelledby="clients-title">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 text-center">
        <h2 id="clients-title" className="font-serif text-2xl md:text-3xl font-bold text-[#0D2E5C] uppercase tracking-tighter">
          Trabajando con las principales firmas constructoras del país
        </h2>
        <div className="h-1 w-20 bg-brand-green mx-auto mt-6 rounded-full"></div>
      </div>
      
      {/* Contenedor del Carrusel Animado */}
      <div className="relative flex w-full overflow-hidden mt-12">
        <motion.div 
          className="flex whitespace-nowrap items-center w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        >
          {/* Se duplica el arreglo varias veces para garantizar que la pantalla ancha no se quede vacía antes de resetear */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-16 px-8 flex-shrink-0">
              {logos.map((logo, j) => (
                <img 
                  key={j} 
                  src={logo} 
                  alt="Firma Constructora Cliente" 
                  className="h-16 md:h-20 w-auto object-contain flex-shrink-0" 
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
