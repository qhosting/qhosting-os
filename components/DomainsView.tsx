
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Plus, Search, RefreshCw, ShieldCheck, Clock, AlertCircle, ChevronRight, 
  ExternalLink, Trash2, Database, Lock, Settings2, ShoppingCart, ArrowRightLeft, 
  CheckCircle2, XCircle, Key, Activity, Sparkles, X, Shield 
} from 'lucide-react';

interface Domain {
  id: number;
  domain: string;
  registrar: string;
  status: string;
  expiry: string;
  autoRenew: boolean;
  privacy: boolean;
}

interface SearchResult {
  tld: string;
  domain: string;
  price: number;
  available: boolean;
  featured: boolean;
}

const DomainsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'marketplace' | 'transfers'>('portfolio');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Marketplace State
  const [marketQuery, setMarketQuery] = useState('');
  const [marketResults, setMarketResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Transfer State
  const [transferForm, setTransferForm] = useState({ domain: '', authCode: '' });
  const [isTransfering, setIsTransfering] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  const fetchDomains = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch('/api/domains/manual');
      if (response.ok) {
        setDomains(await response.json());
      }
    } catch (e) {
      console.error("Fallo de conexión con Registry Node");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleSearchMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/domains/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: marketQuery })
      });
      const data = await res.json();
      setMarketResults(data.results);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePurchase = async (domainResult: SearchResult) => {
    if(!confirm(`¿Confirmar adquisición de activo digital ${domainResult.domain} por $${domainResult.price}?`)) return;
    try {
       const res = await fetch('/api/domains/purchase', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ domain: domainResult.domain })
       });
       if (res.ok) {
         alert("Activo digital añadido al portafolio Titan.");
         setMarketQuery('');
         setMarketResults([]);
         setActiveTab('portfolio');
         fetchDomains(true);
       }
    } catch(e) {
      alert("Fallo en la transacción.");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransfering(true);
    try {
      const res = await fetch('/api/domains/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferForm)
      });
      const data = await res.json();
      if (data.success) {
        alert("Protocolo EPP iniciado. La transferencia puede tardar hasta 5 días hábiles.");
        setTransferForm({ domain: '', authCode: '' });
        setActiveTab('portfolio');
        fetchDomains(true);
      } else {
        alert(data.error || "Código EPP Inválido");
      }
    } finally {
      setIsTransfering(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Desea dar de baja este activo del registro institucional?")) return;
    await fetch(`/api/domains/manual/${id}`, { method: 'DELETE' });
    setDomains(prev => prev.filter(d => d.id !== id));
    if (selectedDomain?.id === id) setSelectedDomain(null);
  };

  const filteredDomains = useMemo(() => {
    return domains.filter(d => d.domain.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [domains, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Titan Registry Command</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Aurum Capital Digital Asset Management</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
           <button 
             onClick={() => setActiveTab('portfolio')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'portfolio' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white'}`}
           >
             <Database size={14} /> Portafolio
           </button>
           <button 
             onClick={() => setActiveTab('marketplace')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'marketplace' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white'}`}
           >
             <ShoppingCart size={14} /> Marketplace
           </button>
           <button 
             onClick={() => setActiveTab('transfers')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'transfers' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white'}`}
           >
             <ArrowRightLeft size={14} /> Transferencias
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4">
           {/* List */}
           <div className="lg:col-span-2 titan-glass rounded-[2.5rem] border border-slate-800/50 overflow-hidden min-h-[500px]">
              <div className="p-8 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between gap-6">
                 <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Filtrar activos..."
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <button onClick={() => fetchDomains()} className="p-4 bg-slate-800 rounded-2xl text-slate-500 hover:text-cyan-400 transition-all">
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800/50 bg-slate-900/10">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Activo</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                        <th className="px-8 py-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                       {filteredDomains.map(d => (
                         <tr 
                           key={d.id} 
                           onClick={() => setSelectedDomain(d)}
                           className={`hover:bg-cyan-400/5 transition-colors cursor-pointer group ${selectedDomain?.id === d.id ? 'bg-cyan-400/10' : ''}`}
                         >
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${d.status === 'active' ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400' : 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'}`}>
                                     <Globe size={18} />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-sm font-black text-white italic tracking-tight">{d.domain}</span>
                                     <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{d.registrar}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                                 d.status === 'active' 
                                 ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                 : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                               }`}>
                                  {d.status === 'active' ? <ShieldCheck size={12}/> : <Clock size={12}/>}
                                  {d.status === 'active' ? 'Protegido' : 'Transferencia'}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                                 className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Details Drawer */}
           <div className="relative">
              {selectedDomain ? (
                <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800 animate-in fade-in zoom-in-95 sticky top-0">
                   <div className="flex justify-between items-start mb-8">
                     <div className="w-14 h-14 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-cyan-glow">
                       <Settings2 size={28} />
                     </div>
                     <button onClick={() => setSelectedDomain(null)} className="text-slate-600 hover:text-white transition-colors">
                       <XCircle size={20} />
                     </button>
                   </div>
                   
                   <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">{selectedDomain.domain}</h3>
                   <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-8">Centro de Control de Zona DNS</p>

                   <div className="space-y-6">
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Ciclo de Vida</p>
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-200">Expira: {selectedDomain.expiry}</span>
                           {selectedDomain.autoRenew && <span className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1"><RefreshCw size={10}/> Auto-Renew</span>}
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex justify-between items-center">
                           Privacidad WHOIS {selectedDomain.privacy ? <Lock size={10} className="text-green-500"/> : <Lock size={10} className="text-red-500"/>}
                        </p>
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-4 rounded-full relative transition-all ${selectedDomain.privacy ? 'bg-green-500' : 'bg-slate-800'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedDomain.privacy ? 'left-4.5' : 'left-0.5'}`}></div>
                           </div>
                           <span className="text-[9px] font-bold text-slate-400 uppercase">{selectedDomain.privacy ? 'Identidad Oculta' : 'Datos Públicos'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 group relative overflow-hidden">
                         <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Titan Nameservers</p>
                         <div className="space-y-1 font-mono text-[10px] text-cyan-400/80">
                            <p>ns1.titan-dns-layer.net</p>
                            <p>ns2.titan-dns-layer.net</p>
                         </div>
                      </div>
                   </div>

                   <button className="w-full mt-8 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-800">
                      <ExternalLink size={14} /> Editor de Zona Avanzado
                   </button>
                </div>
              ) : (
                <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 h-[400px] flex flex-col items-center justify-center text-center opacity-50 italic">
                  <Globe size={48} className="text-slate-700 mb-6" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Seleccione un activo para gestión DNS</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="titan-glass p-12 rounded-[3rem] border border-slate-800/50 animate-in fade-in zoom-in-95">
           <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                 <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Adquisición de Activos</h3>
                 <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Búsqueda Global Multi-TLD en Aurum Registry</p>
              </div>

              <form onSubmit={handleSearchMarket} className="relative mb-12">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400" size={24} />
                 <input 
                   type="text" 
                   placeholder="Escriba su próxima identidad digital..."
                   value={marketQuery}
                   onChange={(e) => setMarketQuery(e.target.value)}
                   className="w-full bg-slate-950/80 border border-slate-800 rounded-[2rem] py-6 pl-16 pr-6 text-xl text-white focus:border-cyan-400 focus:shadow-cyan-glow outline-none transition-all font-bold placeholder:text-slate-800"
                 />
                 <button 
                   type="submit" 
                   disabled={isSearching}
                   className="absolute right-3 top-2 bottom-2 px-8 bg-cyan-400 text-slate-950 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all disabled:opacity-50"
                 >
                   {isSearching ? <RefreshCw className="animate-spin" size={16} /> : 'Verificar'}
                 </button>
              </form>

              <div className="space-y-4">
                 {marketResults.map((result, idx) => (
                   <div key={idx} className="flex items-center justify-between p-6 bg-slate-950/40 border border-slate-800 rounded-[2rem] hover:border-cyan-400/30 transition-all group">
                      <div className="flex items-center gap-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black italic ${
                           result.available ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                         }`}>
                            {result.tld}
                         </div>
                         <div>
                            <div className="flex items-center gap-3">
                               <p className="text-lg font-black text-white italic tracking-tight">{result.domain}</p>
                               {result.featured && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase rounded border border-yellow-500/30 flex items-center gap-1"><Sparkles size={8}/> Premium</span>}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                               {result.available ? 'Disponible para registro inmediato' : 'Dominio Ocupado / Premium'}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         {result.available && (
                           <p className="text-xl font-black text-white italic tracking-tighter">${result.price}</p>
                         )}
                         <button 
                           disabled={!result.available}
                           onClick={() => handlePurchase(result)}
                           className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                             result.available 
                             ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-500 hover:scale-110 shadow-cyan-glow' 
                             : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                           }`}
                         >
                            {result.available ? <Plus size={20} /> : <X size={20} />}
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="titan-glass p-12 rounded-[3rem] border border-slate-800/50 flex flex-col md:flex-row items-center gap-12 animate-in fade-in zoom-in-95">
           <div className="flex-1 space-y-8">
              <div>
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Protocolo EPP (Auth Code)</h3>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">
                   Importe sus activos digitales desde registradores externos hacia el ecosistema seguro de Aurum Capital. Requiere desbloqueo previo en el registrador de origen.
                 </p>
              </div>

              <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400"/> Renovación +1 Año</div>
                 <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400"/> Sin Downtime</div>
                 <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400"/> Titan DNS Gratis</div>
              </div>

              <form onSubmit={handleTransfer} className="space-y-6 max-w-lg">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Dominio a Transferir</label>
                    <input 
                      type="text" 
                      placeholder="mi-empresa.com"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-cyan-400 outline-none transition-all font-bold text-sm"
                      value={transferForm.domain}
                      onChange={(e) => setTransferForm({...transferForm, domain: e.target.value})}
                      required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">EPP / Auth Code</label>
                    <div className="relative">
                       <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                       <input 
                         type="text" 
                         placeholder="Xy9#mK2$..."
                         className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 pl-14 text-white focus:border-cyan-400 outline-none transition-all font-mono text-sm"
                         value={transferForm.authCode}
                         onChange={(e) => setTransferForm({...transferForm, authCode: e.target.value})}
                         required
                       />
                    </div>
                 </div>
                 <button 
                   type="submit"
                   disabled={isTransfering}
                   className="px-10 py-5 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl transition-all shadow-cyan-glow uppercase text-[10px] tracking-widest flex items-center gap-3 disabled:opacity-50"
                 >
                    {isTransfering ? <RefreshCw className="animate-spin" size={16}/> : <ArrowRightLeft size={16} />} 
                    Iniciar Transferencia
                 </button>
              </form>
           </div>
           
           <div className="w-full md:w-1/3 flex justify-center opacity-80">
              <Shield className="text-slate-800" size={200} />
           </div>
        </div>
      )}

    </div>
  );
};

export default DomainsView;
