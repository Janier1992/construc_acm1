/**
 * @file WhatsAppButton.tsx
 * @description Botón flotante premium para contacto directo por WhatsApp.
 * @module components/WhatsAppButton
 */
import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = () => {
  const phoneNumber = "573148938973";
  const message = encodeURIComponent("Hola que tal, me comunico con ustedes porque estoy interesado en llevar a cabo un proyecto y quisiera recibir más información al respecto");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[90] bg-[#25D366] text-white p-4 rounded-2xl shadow-2xl shadow-[#25D366]/40 flex items-center justify-center group transition-all"
      aria-label="Contactar por WhatsApp"
    >
      <div className="absolute -top-12 right-0 bg-white text-[#0D2E5C] text-[0.6rem] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-100">
        ¿Necesitas ayuda? Escríbenos
      </div>
      <MessageCircle size={28} className="fill-white/20" />
      <span className="absolute inset-0 rounded-2xl bg-[#25D366] animate-ping opacity-20 -z-10"></span>
    </motion.a>
  );
};
