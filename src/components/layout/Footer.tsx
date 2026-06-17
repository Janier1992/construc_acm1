/**
 * @file Footer.tsx
 * @description Componente pie de página de la aplicación. Contiene información legal, enlaces
 * de contacto directo (WhatsApp, Teléfono, Correo) y un acceso oculto al panel administrativo.
 * @module layout/Footer
 */
import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Logo } from './Navbar'; // Reutilizamos el Logo del Navbar

interface FooterProps {
  /** Función que se ejecuta al presionar "Módulo Administrativo" */
  onAdminClick: () => void;
}

export const Footer = ({ onAdminClick }: FooterProps) => (
  <footer className="bg-[#0D2E5C] py-16 md:py-24 px-6 md:px-12 border-t border-white/5" role="contentinfo" aria-label="Pie de página">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
      
      {/* Columna 1: Branding y Lema */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <div className="font-serif text-3xl text-white font-bold tracking-tighter uppercase leading-none">
            CONSTRUCTORA <br /> <span className="text-brand-green">ACM 1 S.A.S.</span>
          </div>
        </div>
        <p className="text-white/50 text-sm leading-relaxed max-w-xs font-light italic">
          "Construimos soluciones sólidas para un futuro mejor."
        </p>
      </div>

      {/* Columna 2: Información Legal y Dirección */}
      <div className="space-y-8">
        <h4 className="text-[0.7rem] font-black tracking-[0.4em] uppercase text-brand-green">Información Legal</h4>
        <div className="space-y-4 text-white/40 text-xs font-medium">
          <p>NIT: 901.909.512</p>
          <p>REP: Arinsson Cossio Moreno</p>
          <p>Sede: Carrera 105 # 50-44</p>
          <p>Medellín, Col.</p>
        </div>
      </div>

      {/* Columna 3: Redes Sociales y Acceso Admin */}
      <div className="space-y-8 md:text-right">
        <div className="flex justify-start md:justify-end gap-6">
          <a 
            href="https://wa.me/573148938973?text=Hola%20que%20tal%2C%20me%20comunico%20con%20ustedes%20porque%20estoy%20interesado%20en%20llevar%20a%20cabo%20un%20proyecto%20y%20quisiera%20recibir%20m%C3%A1s%20informaci%C3%B3n%20al%20respecto" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white/20 hover:text-brand-green transition-colors" 
            aria-label="WhatsApp Contact"
          >
            <MessageCircle size={24} />
          </a>
          <a href="tel:+573148938973" className="text-white/20 hover:text-brand-green transition-colors" aria-label="Phone Contact">
            <Phone size={24} />
          </a>
          <a href="mailto:constructoraacm1@outlook.com" className="text-white/20 hover:text-brand-green transition-colors" aria-label="Email Us">
            <Mail size={24} />
          </a>
        </div>
        
        <div className="space-y-4">
          <p className="text-[0.65rem] text-white/20 uppercase tracking-[0.2em] font-bold">© 2026 CONSTRUCTORA ACM 1 S.A.S.</p>
          <button 
            onClick={onAdminClick}
            className="text-white/10 hover:text-brand-green text-[0.6rem] uppercase tracking-widest transition-colors font-bold"
            id="admin-entry"
            aria-label="Acceder al Módulo Administrativo"
          >
            Módulo Administrativo
          </button>
        </div>
      </div>

    </div>
  </footer>
);
