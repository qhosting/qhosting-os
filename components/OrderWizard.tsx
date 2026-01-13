
import React, { useState, useEffect } from 'react';
import { Search, Server, Shield, CheckCircle2, ChevronRight, ArrowLeft, ExternalLink, RefreshCw, X, Globe, Zap, Database, Layout, Link2, Users } from 'lucide-react';

type OrderType = 'ecosystem' | 'hosting_only' | 'domain_only';

interface OrderWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const OrderWizard: React.FC<OrderWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>('ecosystem');
  const [isLoading, setIsLoading] = useState(false);
  const [isDomainChecking, setIsDomainChecking] = useState(false);
  
  // Data State
  const [plans, setPlans] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  const [formData, setFormData] = useState({
    domain: '',
    isDomainAvailable: false,
    plan: '',
    billingCycle: 'monthly'
  });

  useEffect(() => {
    fetch('/api/clients').then(res => res.json()).then(data => setClients(data));
    fetch('/api/plans').then(res => res.json()).then(data => setPlans(data));
  }, []);

  // Calculate dynamic max steps based on flow
  const getMaxSteps = () => {
    if (orderType === 'domain_only') return 3; // Type -> Domain -> Summary -> (Success is virtual 4)
    return 4; // Type -> Domain -> Plan -> Summary -> (Success is virtual 5)
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const selectOrderType = (type: OrderType) => {
    setOrderType(type);
    nextStep();
  };

  const handleDomainCheck = () => {
    if (!formData.domain) return;
    setIsDomainChecking(true);
    
    // Simulation of DNS/Availability check
    setTimeout(() => {
      setIsDomainChecking(false);
      setFormData(prev => ({ ...prev, isDomainAvailable: true }));
    }, 1200);
  };

  const handleOrderSync = async () => {
    setIsLoading(true);
    
    try {
        await fetch('/api/services/provision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                domain: formData.domain,
                plan: formData.plan,
                type: orderType,
                clientId: selectedClientId
            })
        });
        
        // Success
        nextStep();
    } catch (error) {
        console.error("Provisioning failed", error);
    } finally {
        setIsLoading(false);
    }
  };

  // Helper to get Plan details
  const selectedPlan = plans.find(p => p.id === formData.plan);
  const domainPrice = 15.00; // Mock price
  
  const calculateTotal = () => {
    let total = 0;
    if (orderType !== 'hosting_only') total += domainPrice;
    if (orderType !== 'domain_only' && selectedPlan) total += parseFloat(selectedPlan.price);
    return total.toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 relative">
      {onCancel && (
        <button 
            onClick={onCancel}
            className="absolute top-0 right-0 p-3 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl hover:text-white transition-all z-50 hover:bg-red-500/20 hover:text-red-400"
        >
            <X size={20} />
        </button>
      )}

      {/* Progress Bar Dynamic */}
      <div className="flex items-center justify-center mb-12 relative px-10">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-cyan-400 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / (getMaxSteps())) * 100}%` }}></div>
        
        {Array.from({ length: getMaxSteps() + 1 }).map((_, i) => {
          const stepNum = i + 1;
          const isCompleted = step > stepNum;
          const isCurrent = step === stepNum;
          
          return (
            <div key={stepNum} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              isCompleted || isCurrent 
                ? 'bg-slate-950 border-cyan-400 text-cyan-400 shadow-cyan-glow' 
                : 'bg-slate-900 border-slate-700 text-slate-500'
            } ${i > 0 ? 'ml-auto' : ''}`}>
               {isCompleted ? <CheckCircle2 size={20} /> : <span className="text-xs font-black">{stepNum}</span>}
            </div>
          );
        })}
      </div>

      <div className="titan-glass rounded-[3rem] p-12 border border-slate-800 animate-in slide-in-from-bottom-4 shadow-2xl relative overflow-hidden min-h-[600px]">
        
        {/* STEP 1: ARCHITECTURE SELECTION */}
        {step === 1 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tighter">Defina su Arquitectura</h2>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Seleccione el tipo de despliegue requerido</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Option A: Full Ecosystem */}
               <div 
                 onClick={() => selectOrderType('ecosystem')}
                 className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-400 hover:shadow-cyan-glow transition-all cursor-pointer group flex flex-col gap-6"
               >
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 group-hover:scale-110 transition-transform">
                     <Layout size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase italic mb-2">Ecosistema Completo</h3>
                     <p className="text-xs text-slate-400 leading-relaxed font-medium">Dominio + Hosting Titan NVMe. La solución llave en mano para nuevos proyectos.</p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">
                     Recomendado <ArrowLeft className="rotate-180" size={14} />
                  </div>
               </div>

               {/* Option B: Infrastructure Only */}
               <div 
                 onClick={() => selectOrderType('hosting_only')}
                 className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer group flex flex-col gap-6"
               >
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                     <Server size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase italic mb-2">Solo Infraestructura</h3>
                     <p className="text-xs text-slate-400 leading-relaxed font-medium">Conecte un dominio existente mediante DNS a nuestros nodos Titan de alto rendimiento.</p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-500 transition-colors">
                     Migración <ArrowLeft className="rotate-180" size={14} />
                  </div>
               </div>

               {/* Option C: Domain Only */}
               <div 
                 onClick={() => selectOrderType('domain_only')}
                 className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all cursor-pointer group flex flex-col gap-6"
               >
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                     <Globe size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase italic mb-2">Activo Digital</h3>
                     <p className="text-xs text-slate-400 leading-relaxed font-medium">Registro de dominio y protección de marca. Sin aprovisionamiento de servidor.</p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-yellow-500 transition-colors">
                     Registro <ArrowLeft className="rotate-180" size={14} />
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* STEP 2: DOMAIN CONFIGURATION */}
        {step === 2 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tighter">
                 {orderType === 'hosting_only' ? 'Conexión de Dominio' : 'Búsqueda de Identidad'}
              </h2>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                 {orderType === 'hosting_only' ? 'Ingrese el dominio que apuntará a nuestros Nameservers' : 'Verifique la disponibilidad en el registro global'}
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
               <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-[2rem] border border-slate-700 focus-within:border-cyan-400/50 transition-all">
                 <div className="pl-6 text-slate-500">
                    {orderType === 'hosting_only' ? <Link2 size={24} /> : <Search size={24} />}
                 </div>
                 <input 
                   type="text" 
                   placeholder={orderType === 'hosting_only' ? "midominio.com" : "nueva-idea.com"} 
                   className="flex-1 bg-transparent border-none outline-none text-xl py-4 text-white placeholder:text-slate-700 font-bold"
                   value={formData.domain}
                   onChange={(e) => {
                      setFormData({...formData, domain: e.target.value, isDomainAvailable: false});
                   }}
                 />
                 <button 
                   onClick={handleDomainCheck} 
                   disabled={isDomainChecking || !formData.domain}
                   className="bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 px-10 py-5 rounded-[1.5rem] font-black transition-all uppercase text-[10px] tracking-widest shadow-cyan-glow flex items-center gap-2"
                 >
                   {isDomainChecking ? <RefreshCw className="animate-spin" size={16} /> : (orderType === 'hosting_only' ? 'Validar DNS' : 'Buscar')}
                 </button>
               </div>

               {formData.isDomainAvailable && (
                  <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-2">
                     <div className="flex items-center gap-4">
                        <CheckCircle2 className="text-green-500" size={24} />
                        <div>
                           <p className="text-sm font-black text-white uppercase italic">
                              {orderType === 'hosting_only' ? 'Dominio Válido' : 'Dominio Disponible'}
                           </p>
                           {orderType !== 'hosting_only' && <p className="text-xs text-slate-400 font-bold">$15.00 / Año</p>}
                        </div>
                     </div>
                     <button 
                       onClick={nextStep}
                       className="px-8 py-3 bg-green-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-400 transition-colors shadow-lg"
                     >
                        Continuar
                     </button>
                  </div>
               )}
            </div>
            
            <div className="flex justify-start mt-12">
               <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">
                  <ArrowLeft size={14} /> Regresar a Selección
               </button>
            </div>
          </div>
        )}

        {/* STEP 3: INFRASTRUCTURE PLAN (Skipped for Domain Only) */}
        {step === 3 && orderType !== 'domain_only' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-2 italic uppercase tracking-tighter">Selección de Recursos</h2>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Escalabilidad NVMe pura</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => setFormData({...formData, plan: plan.id})}
                  className={`p-8 rounded-[2rem] cursor-pointer transition-all border-2 relative overflow-hidden group ${
                    formData.plan === plan.id ? 'border-cyan-400 bg-cyan-400/5 shadow-cyan-glow scale-105 z-10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                      <Server size={80} />
                  </div>
                  <Server className={formData.plan === plan.id ? 'text-cyan-400' : 'text-slate-600'} size={32} />
                  <h3 className="font-black text-xl mt-6 text-slate-100 uppercase italic tracking-tighter">{plan.name}</h3>
                  <div className="mt-8 pt-8 border-t border-slate-800">
                    <span className="text-3xl font-black text-white tracking-tighter">${plan.price}</span>
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">/mes</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-12">
              <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">
                <ArrowLeft size={14} /> Cambiar Dominio
              </button>
              <button 
                onClick={nextStep} 
                disabled={!formData.plan}
                className="bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 px-10 py-4 rounded-xl font-black flex items-center gap-2 shadow-cyan-glow uppercase text-[10px] tracking-widest"
              >
                Revisar Orden <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: SUMMARY (Step 3 for Domain Only, Step 4 for Others) */}
        {((step === 3 && orderType === 'domain_only') || step === 4) && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8">
             <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-2 italic uppercase tracking-tighter">Resumen de Orden</h2>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Confirmación final antes del aprovisionamiento</p>
            </div>

            <div className="bg-slate-900/50 rounded-[2.5rem] p-10 border border-slate-800 space-y-4 max-w-2xl mx-auto relative overflow-hidden">
               {/* Watermark */}
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Database size={150} />
               </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Tipo de Orden:</span>
                <span className="text-white font-bold uppercase text-xs bg-slate-800 px-3 py-1 rounded-lg">
                   {orderType === 'ecosystem' ? 'Ecosistema' : orderType === 'hosting_only' ? 'Infraestructura' : 'Activo Digital'}
                </span>
              </div>

              {orderType !== 'hosting_only' && (
                 <div className="flex justify-between items-center py-2">
                   <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Registro Dominio ({formData.domain}):</span>
                   <span className="text-white font-mono text-sm">$15.00</span>
                 </div>
              )}

              {orderType === 'hosting_only' && (
                 <div className="flex justify-between items-center py-2">
                   <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Conexión DNS ({formData.domain}):</span>
                   <span className="text-white font-mono text-sm">$0.00</span>
                 </div>
              )}

              {orderType !== 'domain_only' && (
                 <div className="flex justify-between items-center py-2">
                   <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Hosting Titan ({selectedPlan?.name}):</span>
                   <span className="text-white font-mono text-sm">${selectedPlan?.price}</span>
                 </div>
              )}

              {/* CLIENT ASSIGNMENT SECTION */}
              <div className="py-4 border-t border-slate-800 mt-4">
                 <label className="text-slate-500 text-xs font-black uppercase tracking-widest block mb-3 flex items-center gap-2">
                   <Users size={14} className="text-cyan-400" /> Asignar a Cliente (CRM)
                 </label>
                 <select 
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-cyan-400 transition-all appearance-none cursor-pointer"
                   value={selectedClientId}
                   onChange={(e) => setSelectedClientId(e.target.value)}
                 >
                    <option value="">-- Seleccionar Cliente Institucional --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.aurumId})</option>
                    ))}
                 </select>
                 <div className="text-[9px] text-slate-600 mt-2 font-black uppercase tracking-widest">
                   * Si se deja vacío, el servicio quedará como "Unassigned" en el inventario.
                 </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-slate-800 pt-6 mt-4">
                <span className="text-slate-200 font-black uppercase text-xs tracking-widest">Total a Pagar (Hoy):</span>
                <span className="text-cyan-400 font-black text-3xl tracking-tighter">${calculateTotal()} USD</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 bg-yellow-400/5 p-6 rounded-3xl border border-yellow-400/10 text-center max-w-2xl mx-auto">
               <Shield className="text-yellow-500" size={32} />
               <p className="text-[10px] text-yellow-500/80 font-black uppercase tracking-widest leading-relaxed">
                 Al procesar esta orden, se generará una cotización en Aurum Master Hub. El aprovisionamiento Titan se activará automáticamente al confirmar el pago.
               </p>
            </div>

            <div className="flex justify-between mt-12 max-w-2xl mx-auto w-full">
              <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px]">
                <ArrowLeft size={14} /> Modificar
              </button>
              <button 
                onClick={handleOrderSync} 
                disabled={isLoading}
                className="bg-cyan-400 hover:bg-cyan-500 text-slate-950 px-12 py-5 rounded-2xl font-black flex items-center gap-3 shadow-cyan-glow uppercase text-[10px] tracking-[0.2em]"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={14} /> : <><ExternalLink size={14} /> GENERAR ORDEN</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP: SUCCESS (Virtual Step 5/6) */}
        {step > getMaxSteps() && (
          <div className="text-center py-12 space-y-8 animate-in zoom-in-95">
            <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
              <CheckCircle2 size={64} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Orden Procesada</h2>
              <p className="text-slate-500 mt-6 max-w-lg mx-auto leading-relaxed font-medium">
                La solicitud de <strong>{orderType === 'ecosystem' ? 'Ecosistema Completo' : orderType === 'domain_only' ? 'Registro de Dominio' : 'Provisión de Hosting'}</strong> ha sido enviada al Ledger de Aurum.
                <br/><br/>
                Complete el pago en la sección de "Facturación" para finalizar la activación.
              </p>
            </div>
            <div className="pt-10">
              <button 
                onClick={() => onComplete ? onComplete() : window.location.reload()} 
                className="bg-slate-800 hover:bg-slate-700 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors shadow-xl"
              >
                Finalizar Asistente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderWizard;
