
import React, { useState, useEffect } from 'react';
import { 
  Server, HardDrive, Cpu, Globe, ExternalLink, RefreshCw, 
  Power, ShieldCheck, Lock, Activity, Settings, Database, 
  Zap, ArrowRight, X, AlertTriangle, Plus, Terminal, User,
  LayoutList, Save, Trash2, Package
} from 'lucide-react';
import OrderWizard from './OrderWizard';

interface HostingService {
  id: string;
  domain: string;
  plan: string;
  ip: string;
  status: 'active' | 'suspended' | 'pending_provision';
  diskUsage: number;
  bandwidthUsage: number;
  cpanelUrl: string;
  location: string;
  ssl: boolean;
  backupStatus: 'success' | 'warning' | 'error';
  phpVersion: string;
  client_name?: string;
}

interface CatalogPlan {
  id: string;
  name: string;
  price: number;
  nodeId: string;
  whmPackage: string;
  disk: string;
  transfer: string;
  features: string[];
}

interface NodeOption {
  id: string;
  ip: string;
  software: string;
}

const ServicesView: React.FC = () => {
  const [viewState, setViewState] = useState<'dashboard' | 'wizard'>('dashboard');
  const [activeTab, setActiveTab] = useState<'services' | 'catalog'>('services');
  
  const [services, setServices] = useState<HostingService[]>([]);
  const [plans, setPlans] = useState<CatalogPlan[]>([]);
  const [nodes, setNodes] = useState<NodeOption[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<HostingService | null>(null);
  const [isSSOLoading, setIsSSOLoading] = useState(false);

  // New Plan Form State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<CatalogPlan>>({
     name: '', price: 0, nodeId: '', whmPackage: '', disk: '10GB', transfer: '100GB', features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [srvRes, planRes, nodeRes] = await Promise.all([
         fetch('/api/services'),
         fetch('/api/plans'),
         fetch('/api/nodes')
      ]);
      if (srvRes.ok) setServices(await srvRes.json());
      if (planRes.ok) setPlans(await planRes.json());
      if (nodeRes.ok) setNodes(await nodeRes.json());
    } catch (e) {
      console.error("Fallo de conexión Titan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSSO = async (serviceId: string) => {
    setIsSSOLoading(true);
    try {
      const res = await fetch(`/api/services/${serviceId}/sso`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
         window.open(data.redirectUrl, '_blank');
      }
    } catch(e) {
      alert("Error en túnel de autenticación");
    } finally {
      setIsSSOLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.nodeId) return alert("Seleccione un nodo objetivo");
    
    // Generate ID from name
    const id = newPlan.name?.toLowerCase().replace(/\s+/g, '_') || `plan_${Date.now()}`;
    
    await fetch('/api/plans', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ ...newPlan, id })
    });
    
    setIsPlanModalOpen(false);
    setNewPlan({ name: '', price: 0, nodeId: '', whmPackage: '', disk: '10GB', transfer: '100GB', features: [] });
    fetchData(true);
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("¿Eliminar plan del catálogo? Esto no afectará servicios activos.")) return;
    await fetch(`/api/plans/${id}`, { method: 'DELETE' });
    fetchData(true);
  };

  const addFeature = () => {
    if (featureInput && newPlan.features) {
       setNewPlan({ ...newPlan, features: [...newPlan.features, featureInput] });
       setFeatureInput('');
    }
  };

  if (viewState === 'wizard') {
    return <OrderWizard onComplete={() => { setViewState('dashboard'); fetchData(); }} onCancel={() => setViewState('dashboard')} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Titan Service Commander</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Gestión de Infraestructura y Despliegue</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
             <button 
               onClick={() => setActiveTab('services')}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'services' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white'}`}
             >
               <Server size={14} /> Instancias
             </button>
             <button 
               onClick={() => setActiveTab('catalog')}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'catalog' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white'}`}
             >
               <LayoutList size={14} /> Catálogo
             </button>
          </div>
          <button 
            onClick={() => setViewState('wizard')}
            className="bg-cyan-400 hover:bg-cyan-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-cyan-glow transition-all active:scale-95 ml-4"
          >
            <Plus size={16} /> Despliegue Manual
          </button>
        </div>
      </div>

      {activeTab === 'services' ? (
        services.length === 0 && !isLoading ? (
          <div className="titan-glass p-20 rounded-[3rem] border border-slate-800/50 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-800 mb-8 border border-slate-800">
               <Server size={48} />
             </div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Sin Servicios Activos</h3>
             <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-8">
               No se detectan nodos Titan vinculados a su identidad institucional. Inicie un despliegue para comenzar.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map(service => (
              <div 
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="titan-glass p-8 rounded-[3rem] border border-slate-800/50 hover:border-cyan-400/30 transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Status Ribbon */}
                <div className={`absolute top-0 right-0 px-8 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest border-b border-l ${
                  service.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                  service.status === 'pending_provision' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                  'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                   {service.status === 'active' ? 'Operational' : service.status === 'pending_provision' ? 'Provisioning' : 'Suspended'}
                </div>

                <div className="flex items-center gap-6 mb-8">
                   <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[1.5rem] flex items-center justify-center border border-slate-800 group-hover:border-cyan-400/30 shadow-2xl transition-all">
                      <Globe size={32} className="text-cyan-400" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-white italic tracking-tighter mb-1">{service.domain}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{service.plan} // {service.location}</p>
                      {service.client_name && (
                         <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/50 border border-slate-800 text-[9px] font-black text-cyan-400/80 uppercase tracking-widest">
                            <User size={10} /> {service.client_name}
                         </span>
                      )}
                   </div>
                </div>

                {service.status === 'pending_provision' ? (
                   <div className="flex items-center gap-3 p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 mb-8">
                      <RefreshCw className="animate-spin text-yellow-500" size={16} />
                      <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">
                         El worker Titan está configurando el entorno cPanel...
                      </p>
                   </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6 mb-8">
                     <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NVMe Storage</span>
                           <span className="text-[9px] font-bold text-white">{service.diskUsage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                           <div className="h-full bg-cyan-400" style={{ width: `${service.diskUsage}%` }}></div>
                        </div>
                     </div>
                     <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bandwidth</span>
                           <span className="text-[9px] font-bold text-white">{service.bandwidthUsage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${service.bandwidthUsage}%` }}></div>
                        </div>
                     </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                         {service.ssl ? <Lock size={10} className="text-green-500"/> : <Lock size={10} className="text-red-500"/>}
                         SSL
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                         <Database size={10} className={service.backupStatus === 'success' ? 'text-green-500' : 'text-yellow-500'} />
                         Backup
                      </div>
                   </div>
                   <button className="flex items-center gap-2 text-[9px] font-black text-cyan-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                     Gestionar <ArrowRight size={12} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* CATALOG VIEW */
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
           <div className="flex justify-between items-center">
              <div>
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Catálogo Maestro</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Productos vinculados a Nodos Titan</p>
              </div>
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all"
              >
                <Plus size={14} /> Nuevo Plan Maestro
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                 <div key={plan.id} className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 hover:border-cyan-400/30 transition-all group relative">
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="absolute top-6 right-6 text-slate-600 hover:text-red-400 transition-colors"
                    >
                       <Trash2 size={16} />
                    </button>
                    
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-800 mb-6">
                       <Package size={24} />
                    </div>
                    
                    <h3 className="text-xl font-black text-white italic uppercase mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                       <span className="text-2xl font-black text-cyan-400">${plan.price}</span>
                       <span className="text-[10px] font-bold text-slate-600 uppercase">/mes</span>
                    </div>

                    <div className="space-y-3 bg-slate-950/30 p-4 rounded-2xl border border-slate-800 mb-6">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-500 uppercase">Node Target</span>
                          <span className="text-[9px] font-bold text-white">{plan.nodeId}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-500 uppercase">WHM Pkg</span>
                          <span className="text-[9px] font-bold text-white font-mono">{plan.whmPackage}</span>
                       </div>
                    </div>

                    <ul className="space-y-2">
                       {plan.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                             <div className="w-1 h-1 bg-cyan-400 rounded-full"></div> {f}
                          </li>
                       ))}
                    </ul>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {isPlanModalOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsPlanModalOpen(false)}></div>
           <div className="relative w-full max-w-lg titan-glass rounded-[3rem] border border-slate-800 shadow-2xl p-10 animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-950">
                    <Package size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Plan Maestro</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Definición de Producto Técnico</p>
                 </div>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Nombre Comercial</label>
                       <input 
                         type="text" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:border-cyan-400 outline-none font-bold"
                         value={newPlan.name}
                         onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Precio Mensual</label>
                       <input 
                         type="number" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:border-cyan-400 outline-none font-bold"
                         value={newPlan.price}
                         onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Nodo Objetivo</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:border-cyan-400 outline-none font-bold appearance-none"
                      value={newPlan.nodeId}
                      onChange={(e) => setNewPlan({...newPlan, nodeId: e.target.value})}
                      required
                    >
                       <option value="">-- Seleccione Nodo --</option>
                       {nodes.map(n => (
                          <option key={n.id} value={n.id}>{n.id} ({n.ip}) - {n.software}</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Nombre Paquete WHM/Plesk</label>
                    <input 
                      type="text" 
                      placeholder="Ej: titan_pro_v1"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:border-cyan-400 outline-none font-mono font-bold"
                      value={newPlan.whmPackage}
                      onChange={(e) => setNewPlan({...newPlan, whmPackage: e.target.value})}
                      required
                    />
                    <p className="text-[8px] text-slate-600 px-2">* Debe coincidir exactamente con el paquete creado en el panel del servidor.</p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Características (Visuales)</label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Ej: SSL Gratis"
                         className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:border-cyan-400 outline-none font-bold"
                         value={featureInput}
                         onChange={(e) => setFeatureInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                       />
                       <button type="button" onClick={addFeature} className="p-3 bg-slate-800 rounded-2xl text-cyan-400"><Plus size={16}/></button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                       {newPlan.features?.map((f, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] text-slate-300 font-bold">{f}</span>
                       ))}
                    </div>
                 </div>

                 <button 
                   type="submit"
                   className="w-full py-5 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl transition-all shadow-cyan-glow uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 mt-4"
                 >
                    <Save size={16}/> Guardar Plan en Catálogo
                 </button>
              </form>
           </div>
         </div>
      )}

      {/* Detail Drawer (Slide-Over) */}
      {selectedService && (
         <div className="fixed inset-y-0 right-0 w-full md:w-[600px] z-[200] animate-in slide-in-from-right duration-500 shadow-2xl">
            <div className="h-full titan-glass border-l border-slate-800 bg-slate-950/90 backdrop-blur-xl flex flex-col p-10 overflow-y-auto custom-scrollbar">
               {/* ... (Keep existing detail drawer logic) ... */}
               <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-cyan-400 rounded-[1.5rem] flex items-center justify-center text-slate-950 shadow-cyan-glow">
                        <Server size={32} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedService.domain}</h3>
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mt-1">{selectedService.ip}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedService(null)} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-900 rounded-xl border border-slate-800">
                     <X size={24} />
                  </button>
               </div>

               <div className="space-y-8">
                  <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl"></div>
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Zap size={14} className="text-cyan-400" /> Acciones Rápidas
                     </h4>
                     <div className="grid grid-cols-2 gap-4 relative z-10">
                        <button 
                          onClick={() => handleSSO(selectedService.id)}
                          disabled={isSSOLoading}
                          className="p-4 bg-slate-950 border border-slate-800 hover:border-orange-500/50 rounded-2xl flex flex-col items-center gap-3 transition-all group"
                        >
                           {isSSOLoading ? <RefreshCw className="animate-spin text-orange-500" size={24}/> : <ExternalLink className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />}
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">cPanel SSO</span>
                        </button>
                        <button className="p-4 bg-slate-950 border border-slate-800 hover:border-cyan-400/50 rounded-2xl flex flex-col items-center gap-3 transition-all group">
                           <Terminal className="text-cyan-400 group-hover:scale-110 transition-transform" size={24} />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Web Terminal</span>
                        </button>
                        <button className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-2xl flex flex-col items-center gap-3 transition-all group">
                           <HardDrive className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">File Manager</span>
                        </button>
                        <button className="p-4 bg-slate-950 border border-slate-800 hover:border-green-500/50 rounded-2xl flex flex-col items-center gap-3 transition-all group">
                           <ShieldCheck className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SSL Tools</span>
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Detalles Técnicos</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800">
                           <p className="text-[9px] font-bold text-slate-500 uppercase">PHP Version</p>
                           <p className="text-sm font-black text-white">{selectedService.phpVersion}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800">
                           <p className="text-[9px] font-bold text-slate-500 uppercase">Web Server</p>
                           <p className="text-sm font-black text-white">LiteSpeed Ent.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800">
                           <p className="text-[9px] font-bold text-slate-500 uppercase">Node ID</p>
                           <p className="text-sm font-black text-white">{selectedService.id}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800">
                           <p className="text-[9px] font-bold text-slate-500 uppercase">Dedicated IP</p>
                           <p className="text-sm font-black text-white">{selectedService.ip}</p>
                        </div>
                        {selectedService.client_name && (
                           <div className="col-span-2 p-4 rounded-2xl bg-slate-900/30 border border-slate-800">
                              <p className="text-[9px] font-bold text-slate-500 uppercase">Propietario (CRM)</p>
                              <p className="text-sm font-black text-white">{selectedService.client_name}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-800">
                     <button className="w-full py-5 border border-red-500/30 text-red-500/80 hover:bg-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                        <Power size={16} /> Solicitar Cancelación de Nodo
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ServicesView;
