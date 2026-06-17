/**
 * @file App.tsx
 * @description Archivo raíz y ensamblador principal de la Landing Page Constru_ACM1.
 * @module App
 */
import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Sections
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Experience } from './components/sections/Experience';
import { Testimonials } from './components/sections/Testimonials';
import { Contact } from './components/sections/Contact';
import { Coverage } from './components/sections/Coverage';
import { WhatsAppButton } from './components/WhatsAppButton';

// Features / Extras
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white font-sans text-[#2C2C2C] selection:bg-[#C9A85C] selection:text-[#0D2E5C] overflow-x-hidden relative flex flex-col">
      <Navbar onAdminClick={() => setShowAdmin(true)} />
      
      <main className="flex-1 w-full overflow-x-hidden">
        <Hero />
        <About />
        <Experience />
        <Testimonials />
        <Contact />
        <Coverage />
      </main>

      <Footer onAdminClick={() => setShowAdmin(true)} />
      
      <WhatsAppButton />

      <React.Suspense fallback={null}>
        <AnimatePresence>
          {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
        </AnimatePresence>
      </React.Suspense>
    </div>
  );
}
