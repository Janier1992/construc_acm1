/**
 * @file BudgetEstimator.tsx
 * @description Herramienta interactiva para calcular un presupuesto aproximado.
 * Permite seleccionar el tipo de obra, la cantidad (ML/M3) y exportar el cálculo
 * a CSV, JSON o compartirlo vía WhatsApp.
 * @module features/BudgetEstimator
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Warehouse, LayoutGrid, ArrowRight, Download, FileText, CheckCircle2, MessageCircle } from 'lucide-react';

export const BudgetEstimator = () => {
  // Estado para el tipo de obra seleccionada (afecta la tarifa base)
  const [type, setType] = useState('pilas');
  // Valor ingresado (cantidad en Metros Lineales o Cúbicos)
  const [val, setVal] = useState<number>(0);
  // Estado para almacenar el resultado del cálculo
  const [estimate, setEstimate] = useState<{
    subtotal: number;
    management: number;
    total: number;
  } | null>(null);

  // Estado para manejar el feedback visual del botón "Copiar JSON"
  const [copySuccess, setCopySuccess] = useState(false);

  /**
   * Ejecuta el cálculo multiplicando la cantidad por la tarifa base (quemada en el código)
   * y calculando un 10% adicional por Administración/Imprevistos (AIU).
   */
  const calculate = () => {
    if (val <= 0) return;
    const rate = type === 'pilas' ? 850000 : type === 'muros' ? 420000 : 350000;
    const subtotal = val * rate;
    const management = subtotal * 0.1; // 10% AIU/Management
    setEstimate({
      subtotal,
      management,
      total: subtotal + management
    });
  };

  /**
   * Genera y descarga un archivo .csv con el detalle del presupuesto calculado.
   */
  const exportCSV = () => {
    if (!estimate) return;
    const data = [
      ['Item', 'Cantidad', 'Valor Unitario', 'Subtotal', 'Admin (10%)', 'Total Estimado'],
      [type.toUpperCase(), val, type === 'pilas' ? 850000 : type === 'muros' ? 420000 : 350000, estimate.subtotal, estimate.management, estimate.total]
    ];
    const csvContent = data.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `presupuesto_acm1_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Abre una nueva ventana de WhatsApp Web/App con un mensaje pre-formateado
   * que incluye el desglose del presupuesto.
   */
  const sendWhatsApp = () => {
    if (!estimate) return;
    const text = `*Presupuesto Estimado - Constructora ACM 1*%0A%0A*Tipo:* ${type.toUpperCase()}%0A*Cantidad:* ${val}%0A*Subtotal:* $${estimate.subtotal.toLocaleString()}%0A*Admin/Imprevistos:* $${estimate.management.toLocaleString()}%0A*Total:* $${estimate.total.toLocaleString()}%0A%0A_Cálculo realizado en constructoraacm1.com_`;
    window.open(`https://wa.me/573147490844?text=${text}`, '_blank');
  };

  /**
   * Copia al portapapeles del usuario un objeto JSON estructurado con el presupuesto.
   * Útil para integrar con otros sistemas de la constructora.
   */
  const copyJSON = () => {
    if (!estimate) return;
    const data = {
      empresa: "Constructora ACM 1 S.A.S.",
      tipo: type,
      cantidad: val,
      unidades: "ML/M3",
      moneda: "COP",
      calculo: {
        subtotal: estimate.subtotal,
        aiu: estimate.management,
        total: estimate.total
      },
      fecha: new Date().toISOString()
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <section className="bg-slate-50 py-32 md:py-48 px-6 md:px-12 border-y border-slate-100" aria-labelledby="calc-title">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Lado Izquierdo: Descripción y Resultados */}
        <div>
          <span className="block text-[0.7rem] font-black tracking-[0.4em] uppercase text-brand-green mb-6">Herramienta Técnica</span>
          <h2 id="calc-title" className="font-serif text-4xl md:text-6xl font-bold text-[#0D2E5C] leading-none mb-8 uppercase tracking-tighter">Estimador de <br /> Presupuesto</h2>
          <p className="text-slate-500 text-lg font-light leading-relaxed mb-10">
            Obtenga un cálculo aproximado del valor de su obra basándose en metros lineales o volumen. Una interfaz diseñada para facilitar la exportación de resultados a sus sistemas administrativos.
          </p>
          
          <AnimatePresence mode="wait">
            {estimate ? (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Cuadro de Resultados Numéricos */}
                <div className="bg-white p-8 shadow-sm border border-slate-100">
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</div>
                      <div className="text-xl font-bold text-[#0D2E5C]">${estimate.subtotal.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">A.I.U (10%)</div>
                      <div className="text-xl font-bold text-[#0D2E5C]">${estimate.management.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <div className="text-[0.65rem] font-black text-brand-green uppercase tracking-widest mb-1">Inversión Estimada</div>
                    <div className="text-4xl font-serif font-black text-[#0D2E5C]">${estimate.total.toLocaleString()}</div>
                  </div>
                </div>

                {/* Botones de Exportación e Integración */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={exportCSV}
                    className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 text-[0.65rem] font-black uppercase tracking-widest hover:border-brand-green transition-colors"
                  >
                    <Download size={16} /> Exportar CSV
                  </button>
                  <button 
                    onClick={copyJSON}
                    className={`flex items-center gap-3 border px-6 py-3 text-[0.65rem] font-black uppercase tracking-widest transition-all ${copySuccess ? 'bg-brand-green text-[#0D2E5C] border-brand-green' : 'bg-white border-slate-200 hover:border-brand-green'}`}
                  >
                    {copySuccess ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                    {copySuccess ? '¡Copiado!' : 'Copiar JSON'}
                  </button>
                  <button 
                    onClick={sendWhatsApp}
                    className="flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 text-[0.65rem] font-black uppercase tracking-widest hover:bg-[#128C7E] transition-colors"
                  >
                    <MessageCircle size={16} /> Enviar WhatsApp
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 bg-slate-100/50 border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Ingrese los parámetros para generar el cálculo</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Lado Derecho: Controles del Formulario */}
        <div className="bg-white p-10 md:p-16 shadow-2xl border-t-4 border-brand-green">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-slate-400">Tipo de Intervención</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { id: 'pilas', label: 'Excavación Pilas', icon: <Search size={14} /> },
                  { id: 'muros', label: 'Muros Contención', icon: <Warehouse size={14} /> },
                  { id: 'vias', label: 'Placa Huellas', icon: <LayoutGrid size={14} /> }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setType(opt.id); setEstimate(null); }}
                    className={`flex items-center justify-center gap-2 py-4 text-[0.6rem] font-bold uppercase tracking-widest border transition-all ${type === opt.id ? 'bg-[#0D2E5C] text-white border-[#0D2E5C]' : 'bg-transparent text-slate-400 border-slate-200 hover:border-brand-green'}`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-slate-400">Magnitud del Proyecto (ML / M3)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={val || ''}
                  onChange={e => { setVal(Number(e.target.value)); setEstimate(null); }}
                  className="w-full bg-slate-50 border-b-2 border-slate-200 p-6 text-2xl font-serif text-[#0D2E5C] focus:border-brand-green outline-none transition-colors"
                  placeholder="0.00"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs uppercase">Unidades</div>
              </div>
            </div>

            <button 
              onClick={calculate}
              disabled={!val}
              className="w-full group bg-[#0D2E5C] text-white py-6 text-[0.7rem] font-black uppercase tracking-[0.4em] hover:bg-brand-green hover:text-[#0D2E5C] transition-all disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-4"
            >
              Procesar Presupuesto
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
            </button>
            <p className="text-[0.55rem] text-slate-400 italic text-center leading-relaxed">
              * El resultado es una aproximación generada por el sistema. <br /> Para una cotización formal compatible con sus sistemas contables, contáctenos.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
