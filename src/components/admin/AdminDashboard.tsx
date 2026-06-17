/**
 * @file AdminDashboard.tsx
 * @description Portal Corporativo Exclusivo de CONSTRUCTORA ACM 1 S.A.S.
 * Orquesta la autenticación Insforge, el sidebar de navegación lateral
 * y el enrutamiento entre las distintas vistas del panel.
 *
 * VISTAS DISPONIBLES:
 *  - home        → Métricas y resumen general
 *  - leads       → Gestión de solicitudes de cotización
 *  - quote       → Generador de cotizaciones con exportación PDF/XLSX
 *  - reviews     → Moderación de testimonios de clientes
 *  - estimator   → Estimador rápido de presupuesto
 *
 * @module admin/AdminDashboard
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, HardHat, LayoutDashboard, FileText, FilePlus2,
  Star, Calculator, LogOut, Menu, ChevronRight, CheckCircle,
  RefreshCw, FileSearch
} from 'lucide-react';
import { insforge, insforgeAuth } from '../../insforge';
/** Usuario autenticado en Insforge */
interface InsforgeUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  last_sign_in_at?: string;
}

// Vistas del panel
import { DashboardHome }    from './views/DashboardHome';
import { LeadsView }        from './views/LeadsView';
import { QuoteBuilder }     from './views/QuoteBuilder';
import { TestimonialsView } from './views/TestimonialsView';
import { HistoryView }      from './views/HistoryView';
import { BudgetEstimator }  from '../features/BudgetEstimator';

// Tipos compartidos
import { Lead, Testimonial, GeneratedQuote } from './types';

// ── Tipos de vista disponibles ────────────────────────────────────────────────
type AdminView = 'home' | 'leads' | 'quote' | 'reviews' | 'history' | 'estimator';

interface AdminDashboardProps {
  onClose: () => void;
}

// ── Items del Sidebar ─────────────────────────────────────────────────────────
const NAV_ITEMS: { view: AdminView; label: string; icon: React.ReactNode; badge?: string }[] = [
  { view: 'home',      label: 'Inicio',        icon: <LayoutDashboard size={18} /> },
  { view: 'leads',     label: 'Solicitudes',   icon: <FileText size={18} /> },
  { view: 'quote',     label: 'Cotizador',     icon: <FilePlus2 size={18} /> },
  { view: 'history',   label: 'Historial',     icon: <RefreshCw size={18} /> },
  { view: 'reviews',   label: 'Testimonios',   icon: <Star size={18} /> },
  { view: 'estimator', label: 'Estimador',     icon: <Calculator size={18} /> },
];

// ─────────────────────────────────────────────────────────────────────────────

export const AdminDashboard = ({ onClose }: AdminDashboardProps) => {
  // ── Estado de autenticación ────────────────────────────────────────────────
  const [user,    setUser]    = useState<InsforgeUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Datos de Insforge ─────────────────────────────────────────────────────
  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [quotes,  setQuotes]  = useState<GeneratedQuote[]>([]);

  // ── Navegación del panel ───────────────────────────────────────────────────
  const [activeView,    setActiveView]    = useState<AdminView>('home');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  /** Lead o Cotización pre-cargada para el generador */
  const [quoteFromLead, setQuoteFromLead] = useState<Lead | null>(null);
  const [quoteToEdit,   setQuoteToEdit]   = useState<GeneratedQuote | null>(null);

  // ── Estado de login ────────────────────────────────────────────────────────
  const [loading,   setLoading]   = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // ── Estado de recuperación de contraseña ────────────────────────────────────
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Correo único autorizado
  // Correos autorizados para gestionar el portal
  const AUTHORIZED_EMAILS = ['constructoraacm1@outlook.com', 'jamosquera0518@gmail.com'];

  // ── Carga de datos desde Insforge (PostgreSQL) ────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resLeads, resReviews, resQuotes] = await Promise.all([
        insforge.database.from('quotes').select('*').order('created_at', { ascending: false }),
        insforge.database.from('testimonials').select('*').order('created_at', { ascending: false }),
        insforge.database.from('generated_quotes').select('*').order('created_at', { ascending: false }),
      ]);

      if (resLeads.error) throw resLeads.error;
      if (resReviews.error) throw resReviews.error;
      if (resQuotes.error) throw resQuotes.error;

      setLeads(resLeads.data || []);
      setReviews(resReviews.data || []);
      setQuotes(resQuotes.data || []);
    } catch (err) {
      console.error('Error al cargar datos del panel:', err);
    }
    setLoading(false);
  }, []);

  // ── Verificación de sesión inicial ──────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: sessionData } = await insforge.auth.getCurrentUser();
        const u = sessionData?.user;
        
        // Verificar inactividad guardada en localStorage
        const lastAct = localStorage.getItem('acm_last_activity');
        const now = Date.now();
        const thirtyMins = 30 * 60 * 1000;

        if (u && lastAct && (now - parseInt(lastAct)) > thirtyMins) {
          await insforge.auth.signOut();
          setUser(null);
          setIsAdmin(false);
        } else if (u) {
          const userEmail = (u.email || '').toLowerCase().trim();
          setUser(u as InsforgeUser);
          
          if (AUTHORIZED_EMAILS.some(email => email.toLowerCase().trim() === userEmail)) {
            setIsAdmin(true);
            localStorage.setItem('acm_admin_session', 'active');
            fetchData();
            localStorage.setItem('acm_last_activity', now.toString());
          } else {
            // Expulsar inmediatamente si no es un correo autorizado
            await insforge.auth.signOut();
            setIsAdmin(false);
            localStorage.removeItem('acm_admin_session');
          }
        }

        // Detectar si venimos de un correo de recuperación (independiente de si hay usuario o no)
        if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
          setIsUpdatingPassword(true);
        }
      } catch (err) {
        console.error('Error verificando sesión:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // ── Monitor de Inactividad ────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !isAdmin) return;

    const resetTimer = () => {
      localStorage.setItem('acm_last_activity', Date.now().toString());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, resetTimer));

    // Verificar cada minuto si debe expirar
    const interval = setInterval(() => {
      const lastAct = localStorage.getItem('acm_last_activity');
      if (lastAct && (Date.now() - parseInt(lastAct)) > (30 * 60 * 1000)) {
        insforge.auth.signOut().then(() => {
          setUser(null);
          setIsAdmin(false);
          window.location.reload();
        });
      }
    }, 60000);

    return () => {
      events.forEach(name => document.removeEventListener(name, resetTimer));
      clearInterval(interval);
    };
  }, [user, isAdmin]);

  /** Envía correo de recuperación de contraseña */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToReset = loginData.email.toLowerCase().trim();
    
    // Bloqueo estricto: solo se permite reset a correos autorizados
    if (!AUTHORIZED_EMAILS.some(email => email.toLowerCase().trim() === emailToReset)) {
      setAuthError('Error: este correo no está registrado como administrador.');
      return;
    }

    setResetStatus('sending');
    setAuthError(null);
    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({
        email: emailToReset,
        redirectTo: window.location.origin + window.location.pathname + '?type=recovery',
      });
      if (error) throw error;
      setResetStatus('sent');
    } catch (err: any) {
      setAuthError(err.message || 'Error al enviar el correo.');
      setResetStatus('idle');
    }
  };

  /** Actualiza la contraseña después de la recuperación */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token') || '';
      
      if (!token) {
        throw new Error('Token de recuperación no válido o vencido.');
      }

      const { error } = await insforge.auth.resetPassword({
        newPassword: newPassword,
        otp: token,
      });
      if (error) throw error;
      
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsUpdatingPassword(false);
      alert('Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
    } catch (err: any) {
      setAuthError(err.message || 'Error al actualizar la contraseña.');
    }
    setLoading(false);
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setAuthError('Credenciales incorrectas. Verifique el correo y la contraseña.');
        } else {
          setAuthError(error.message);
        }
      } else if (data?.user) {
        const u = data.user as InsforgeUser;
        const userEmail = (u.email || '').toLowerCase().trim();
        setUser(u);
        
        if (AUTHORIZED_EMAILS.some(email => email.toLowerCase().trim() === userEmail)) {
          setIsAdmin(true);
          localStorage.setItem('acm_admin_session', 'active');
          fetchData();
        } else {
          await insforge.auth.signOut();
          localStorage.removeItem('acm_admin_session');
          setAuthError('Acceso denegado: este usuario no tiene permisos administrativos.');
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setAuthError('Error de autenticación. Intente nuevamente.');
    }
    setLoading(false);
  };

  /** Cierra la sesión de Insforge y limpia el estado local */
  const handleLogout = async () => {
    try {
      await insforge.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('acm_last_activity');
      localStorage.removeItem('acm_admin_session');
      window.location.reload();
    }
  };

  // ── Navegar a cotización desde un lead ────────────────────────────────────
  const handleCreateQuoteFromLead = (lead: Lead) => {
    setQuoteFromLead(lead);
    setActiveView('quote');
    setSidebarOpen(false);
  };

  // ── Cambiar de vista ───────────────────────────────────────────────────────
  const navigateTo = (view: AdminView) => {
    if (view !== 'quote') setQuoteFromLead(null); // Limpiar lead pre-cargado si no es cotización
    setActiveView(view);
    setSidebarOpen(false);
  };

  // ── Badges de notificación del sidebar ───────────────────────────────────
  const getBadge = (view: AdminView): number => {
    if (view === 'leads')   return leads.filter(l => !l.status || l.status === 'nuevo').length;
    if (view === 'reviews') return reviews.filter(r => !r.approved).length;
    return 0;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: PANTALLA DE LOGIN
  // ────────────────────────────────────────────────────────────────────────────
  const LoginScreen = (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Encabezado */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#0D2E5C] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#0D2E5C]/20">
            <HardHat className="w-10 h-10 text-brand-green" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#0D2E5C] uppercase tracking-tighter">Portal Corporativo</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Acceso Exclusivo — ACM 1 S.A.S.</p>
        </div>

        {/* Tarjeta de Login / Recuperación */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
          {/* ── Mensajes de Error Compartidos ── */}
          <AnimatePresence>
            {authError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-red-500 text-xs font-bold bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6"
              >
                {authError}
              </motion.p>
            )}
          </AnimatePresence>
          {isUpdatingPassword ? (
            /* ── VISTA: ACTUALIZAR CONTRASEÑA ── */
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <p className="text-sm text-slate-500 mb-4 text-center">Establece tu nueva contraseña de acceso.</p>
              <div className="space-y-1.5">
                <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Nueva Contraseña</label>
                <input type="password" required minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-[#0D2E5C] focus:border-brand-green outline-none transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#0D2E5C] text-white py-4 rounded-xl text-[0.7rem] font-black uppercase tracking-widest hover:bg-brand-green hover:text-[#0D2E5C] transition-all disabled:opacity-50"
              >
                {loading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          ) : isResetMode ? (
            /* ── VISTA: RECUPERAR CONTRASEÑA ── */
            <form onSubmit={handleResetPassword} className="space-y-6">
              {resetStatus === 'sent' ? (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Correo enviado a {loginData.email}. Revisa tu bandeja de entrada.</p>
                  <button type="button" onClick={() => { setIsResetMode(false); setAuthError(null); }} className="text-xs text-[#0D2E5C] font-black uppercase tracking-widest hover:underline">
                    Volver al Login
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4">Te enviaremos un enlace para que puedas cambiar tu contraseña.</p>
                  <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                    <input type="email" required
                      value={loginData.email}
                      onChange={e => setLoginData({...loginData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-[#0D2E5C] focus:border-brand-green outline-none transition-colors"
                      placeholder="correo@empresa.com"
                    />
                  </div>
                  <button type="submit" disabled={resetStatus === 'sending'}
                    className="w-full bg-[#0D2E5C] text-white py-4 rounded-xl text-[0.7rem] font-black uppercase tracking-widest hover:bg-brand-green hover:text-[#0D2E5C] transition-all disabled:opacity-50"
                  >
                    {resetStatus === 'sending' ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                  </button>
                  <button type="button" onClick={() => { setIsResetMode(false); setAuthError(null); }} className="w-full text-xs text-slate-400 font-bold hover:text-[#0D2E5C] uppercase tracking-widest transition-colors">
                    Cancelar
                  </button>
                </>
              )}
            </form>
          ) : (
            /* ── VISTA: LOGIN NORMAL ── */
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                <input type="email" required
                  value={loginData.email}
                  onChange={e => setLoginData({...loginData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-[#0D2E5C] focus:border-brand-green outline-none transition-colors"
                  placeholder="correo@empresa.com"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Contraseña</label>
                  <button type="button" onClick={() => { setIsResetMode(true); setAuthError(null); }} className="text-[0.6rem] font-bold text-slate-400 hover:text-brand-green uppercase tracking-widest transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input type="password" required
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-[#0D2E5C] focus:border-brand-green outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#0D2E5C] text-white py-4 rounded-xl text-[0.7rem] font-black uppercase tracking-widest hover:bg-brand-green hover:text-[#0D2E5C] transition-all disabled:opacity-50 shadow-lg shadow-[#0D2E5C]/20"
              >
                {loading ? 'Verificando...' : 'Entrar al Sistema'}
              </button>
            </form>
          )}

          {user && !isAdmin && !isUpdatingPassword && (
            <button onClick={handleLogout} className="mt-6 w-full text-xs text-red-500 font-bold hover:underline uppercase text-center">
              Cerrar Sesión Incorrecta
            </button>
          )}
        </div>

        {/* Botón Volver */}
        <button onClick={onClose} className="mt-6 flex items-center gap-1 text-slate-400 text-xs hover:text-[#0D2E5C] transition-colors mx-auto">
          ← Volver a la página
        </button>
      </motion.div>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: PANEL COMPLETO (USUARIO AUTENTICADO)
  // ────────────────────────────────────────────────────────────────────────────
  const DashboardScreen = (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* ── Overlay móvil (cierra sidebar) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-[#0D2E5C] text-white
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Marca */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shrink-0">
              <HardHat className="w-5 h-5 text-[#0D2E5C]" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold leading-tight">CONSTRUCTORA</p>
              <p className="text-brand-green text-xs font-black tracking-widest">ACM 1 S.A.S.</p>
            </div>
          </div>
          <p className="text-white/30 text-[0.55rem] uppercase tracking-widest mt-3 font-bold">Portal Corporativo</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const badge = getBadge(item.view);
            const active = activeView === item.view;
            return (
              <button key={item.view} onClick={() => navigateTo(item.view)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-brand-green text-[#0D2E5C]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-[0.7rem] uppercase tracking-widest">{item.label}</span>
                </span>
                {badge > 0 && (
                  <span className={`text-[0.55rem] font-black rounded-full w-5 h-5 flex items-center justify-center ${
                    active ? 'bg-[#0D2E5C] text-brand-green' : 'bg-brand-green text-[#0D2E5C]'
                  }`}>
                    {badge}
                  </span>
                )}
                {active && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>

        {/* Usuario y Cerrar Sesión */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 mb-3">
            <p className="text-[0.55rem] text-white/40 uppercase tracking-widest font-bold">Sesión activa</p>
            <p className="text-xs text-white/80 font-bold mt-0.5 truncate">{user?.email}</p>
          </div>
          <button
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 text-[0.65rem] font-black uppercase tracking-widest text-slate-400 hover:text-brand-green hover:bg-white/5 transition-all rounded-xl mt-4 border-t border-white/5 pt-6"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Volver a la Web
            </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-[0.6rem] font-black uppercase tracking-widest transition-all rounded-xl mt-2 px-4 py-3 hover:bg-red-500/10"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Barra superior */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-[#0D2E5C]" />
          </button>
          <div className="hidden lg:block">
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
              {NAV_ITEMS.find(n => n.view === activeView)?.label}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors ml-auto">
            <X className="w-5 h-5 text-[#0D2E5C]" />
          </button>
        </header>

        {/* Vista activa */}
        <div className="p-6 md:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'home' && (
                <DashboardHome
                  leads={leads}
                  reviews={reviews}
                  quotes={quotes}
                  onGoToLeads={() => navigateTo('leads')}
                  onGoToQuote={() => navigateTo('quote')}
                  onGoToHistory={() => navigateTo('history')}
                />
              )}
              {activeView === 'leads' && (
                <LeadsView
                  leads={leads}
                  onCreateQuote={handleCreateQuoteFromLead}
                  onRefresh={fetchData}
                />
              )}
              {activeView === 'quote' && (
                <QuoteBuilder
                  key={quoteToEdit?.id || quoteFromLead?.id || 'new-manual'}
                  prefillLead={quoteFromLead}
                  prefillQuote={quoteToEdit}
                  onBack={() => {
                    if (quoteToEdit) navigateTo('history');
                    else if (quoteFromLead) navigateTo('leads');
                    else navigateTo('home');
                    setQuoteFromLead(null);
                    setQuoteToEdit(null);
                    fetchData(); // Recargar tras posible guardado
                  }}
                />
              )}
              {activeView === 'history' && (
                <HistoryView 
                  quotes={quotes}
                  onRefresh={fetchData}
                  onEdit={(q) => {
                    setQuoteToEdit(q);
                    setQuoteFromLead(null);
                    navigateTo('quote');
                  }}
                />
              )}
              {activeView === 'reviews' && (
                <TestimonialsView reviews={reviews} onRefresh={fetchData} />
              )}
              {activeView === 'estimator' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-brand-green mb-1">Herramienta</p>
                    <h2 className="font-serif text-2xl font-bold text-[#0D2E5C] tracking-tighter">Estimador Rápido de Presupuesto</h2>
                  </div>
                  <BudgetEstimator />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );

  // ── Selección de pantalla ─────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
          <RefreshCw className="w-8 h-8 text-[#0D2E5C] animate-spin mb-4" />
          <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Verificando Credenciales...</p>
        </div>
      ) : (!user || !isAdmin) ? (
        LoginScreen
      ) : (
        DashboardScreen
      )}
    </motion.div>
  );
};
