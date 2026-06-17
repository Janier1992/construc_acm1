/**
 * @file Navbar.tsx
 * @description Componente de navegación principal. Controla el menú responsivo, el estado de scroll
 * para cambiar estilos (transparente a sólido) y los enlaces internos.
 * @module layout/Navbar
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

/**
 * Componente Logo en SVG vectorizado
 * Renderiza el logo corporativo de ACM 1 con su geometría y colores corporativos.
 */
export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 400 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Círculo decorativo */}
    <path 
      d="M380 200C380 299.411 299.411 380 200 380C100.589 380 20 299.411 20 200C20 160 30 120 50 90" 
      stroke="#84CC16" 
      strokeWidth="25" 
      strokeLinecap="round" 
    />
    
    {/* Edificios de fondo */}
    <rect x="230" y="80" width="40" height="150" fill="#94A3B8" />
    <rect x="280" y="40" width="50" height="200" fill="#0D2E5C" />
    <path d="M230 80L270 40V80H230Z" fill="#94A3B8" opacity="0.5" />
    <path d="M280 40L330 10V40H280Z" fill="#0D2E5C" opacity="0.5" />
    
    {/* Picos representativos / Letra M implícita */}
    <path d="M40 280L140 120L240 280H190L140 200L90 280H40Z" fill="#062F5E" />
    <path d="M130 280L230 100L330 280H280L230 180L180 280H130Z" fill="#84CC16" />
  </svg>
);

interface NavbarProps {
  /** Función que se ejecuta al presionar el botón de "Portal Corporativo" para abrir el modal del administrador. */
  onAdminClick: () => void;
}

export const Navbar = ({ onAdminClick }: NavbarProps) => {
  // Estado para controlar la visibilidad del menú en dispositivos móviles
  const [isOpen, setIsOpen] = useState(false);
  // Estado para determinar si la página ha hecho scroll para aplicar efecto de fondo
  const [scrolled, setScrolled] = useState(false);

  // Efecto que escucha el evento de scroll en la ventana
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-[#0D2E5C] shadow-2xl h-16 border-b border-brand-green/20' : 'bg-transparent h-28'
    }`}>
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 md:px-12">
        {/* Sección del Logotipo */}
        <div className="flex items-center gap-3 font-serif font-extrabold text-white text-lg md:text-2xl tracking-tighter">
          <Logo className="w-10 h-10 md:w-14 md:h-14" />
          <div className="flex flex-col leading-none">
            <span>CONSTRUCTORA</span>
            <span className="text-brand-green text-[0.6em]">ACM 1 S.A.S</span>
          </div>
        </div>

        {/* Menú para Escritorio */}
        <ul className="hidden lg:flex gap-10 list-none">
          {['Nosotros', 'Experiencia', 'Testimonios', 'Contáctenos'].map((item) => (
            <li key={item}>
              <a 
                href={`#${item.toLowerCase()}`} 
                className="text-white/80 hover:text-brand-green transition-all text-[0.7rem] font-bold tracking-[0.15em] uppercase relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-green transition-all group-hover:w-full"></span>
              </a>
            </li>
          ))}
        </ul>

        {/* Botón de acceso al portal de administración */}
        <div className="hidden lg:block">
          <button 
            onClick={onAdminClick}
            className="border border-white/20 text-white hover:border-brand-green hover:text-brand-green px-5 py-2 text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all"
          >
            Portal Corporativo
          </button>
        </div>

        {/* Botón hamburguesa para móviles */}
        <button 
          className="lg:hidden text-white p-2 focus-visible:ring-2 focus-visible:ring-brand-green outline-none" 
          onClick={() => setIsOpen(!isOpen)}
          id="mobile-menu-toggle"
          aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {/* Superposición (Overlay) del Menú Móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-[#0D2E5C] z-50 p-12 flex flex-col justify-center gap-10 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menú móvil"
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-8 right-8 text-white focus-visible:ring-2 focus-visible:ring-brand-green outline-none"
              aria-label="Cerrar menú"
            >
              <X size={32} aria-hidden="true" />
            </button>
            {/* Generación dinámica de enlaces en móvil */}
            {['Nosotros', 'Experiencia', 'Testimonios', 'Contáctenos'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                onClick={() => setIsOpen(false)}
                className="text-white text-3xl font-serif font-bold tracking-tighter hover:text-brand-green transition-colors"
              >
                {item}
              </a>
            ))}
            
            {/* Acceso rápido al Portal en Móvil */}
            <button 
              onClick={() => { setIsOpen(false); onAdminClick(); }}
              className="mt-4 border-2 border-brand-green text-brand-green py-5 px-8 rounded-2xl text-[0.7rem] font-black uppercase tracking-[0.2em] hover:bg-brand-green hover:text-[#0D2E5C] transition-all text-left"
            >
              Portal Corporativo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
