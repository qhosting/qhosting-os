
import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, Eye, Activity, Terminal, RefreshCw, Zap, AlertTriangle, ChevronRight, Globe, Fingerprint, Key, MailX, UserX, ShieldOff, Send, Trash2, RotateCcw } from 'lucide-react';

interface SecurityEvent {
  id: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  ip: string;
  timestamp: string;
}

interface FirewallRule {
  id: number;
  name: string;
  type: 'deny' | 'allow' | 'limit';
  scope: string;
  status: 'active' | 'inactive';
}

interface BlacklistEntry {
  id: number;
  target: string;
  type: 'email' | 'domain';
  reason: string;
  timestamp: string;
  status: 'synced' | 'pending_sync';
}

const SecurityView: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Blacklist Form State
  const [blacklistForm, setBlacklistForm] = useState({
    target_email: '', // Opcional, para log
    block_list_item: '', // El target real
    reason: ''
  });
  const [isBlacklisting, setIsBlacklisting] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [eventsRes, rulesRes, blRes] = await Promise.all([
        fetch('/api/security/events'),
        fetch('/api/security/firewall'),
        fetch('/api/security/blacklist')
      ]);
      if (eventsRes.ok && rulesRes.ok && blRes.ok) {
        setEvents(await eventsRes.json());
        setRules(await rulesRes.json());
        setBlacklist(await blRes.json());
      }
    } catch (e) {
      console.error("Fallo de enlace con el Aurum Shield Hub");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleToggleRule = async (id: number) => {
    try {
      const res = await fetch(`/api/security/firewall/toggle/${id}`, { method: 'POST' });
      if (res.ok) fetchData(true);
    } catch (e) {
      console.error("Error al togglear regla");
    }
  };

  const handleBlacklistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blacklistForm.block_list_item) return;

    setIsBlacklisting(true);
    try {
      const res = await fetch('/api/security/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blacklistForm)
      });
      if (res.ok) {
        setBlacklistForm({ target_email: '', block_list_item: '', reason: '' });
        fetchData(true);
        alert("Bloqueo enviado a cola de propagación global.");
      }
    } catch (e) {
      console.error("Error en el bloqueo de blacklist");
    } finally {
      setIsBlacklisting(false);
    }
  };

  const handleRevokeBlacklist = async (id: number) => {
    if (!confirm("¿Revocar este bloqueo globalmente? Esto eliminará la regla de todos los nodos en el próximo ciclo de sincronización.")) return;
    try {
        await fetch(`/api/security/blacklist/${id}`, { method: 'DELETE' });
        fetchData(true);
    } catch(e) {
        alert("Error al revocar");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Comando Aurum Shield</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Seguridad Perimetral & Inteligencia de Amenazas</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleStartScan}
            disabled={isScanning}
            className="bg-slate-900 border border-slate-800 text-slate-400 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:text-white transition-all disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="animate-spin" size={16} /> : <Eye size={16} />} 
            {isScanning ? `Escaneando: ${scanProgress}%` : 'Lanzar Titan Scan'}
          </button>
          <button className="bg-cyan-400 hover:bg-cyan-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-cyan-glow transition-all active:scale-95">
            <Lock size={16} /> Protocolos de Cifrado
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield size={80} />
          </div>
          <p className="text-3xl font-black text-white italic tracking-tighter">98.2</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Score</p>
          <div className="mt-4 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
             <div className="h-full bg-green-500" style={{ width: '98%' }}></div>
          </div>
        </div>
        <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex items-center gap-6">
          <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-400/20">
            <Zap size={28} />
          </div>
          <div>
            <p className="text-3xl font-black text-white italic tracking-tighter">1,402</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ataques Mitigados</p>
          </div>
        </div>
        <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex items-center gap-6">
          <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 border border-yellow-400/20">
            <Lock size={28} />
          </div>
          <div>
            <p className="text-3xl font-black text-white italic tracking-tighter">24/24</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SSL Certs Active</p>
          </div>
        </div>
        <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex items-center gap-6">
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
            <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-3xl font-black text-white italic tracking-tighter">0</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vulnerabilities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Anti-Spam Blacklist Management */}
        <div className="lg:col-span-12 titan-glass p-10 rounded-[3rem] border border-slate-800/50 relative overflow-hidden">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center text-red-500 border border-red-500/20">
                    <MailX size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Blacklist Global</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Sincronización Multi-Nodo (cPanel/Plesk)</p>
                 </div>
              </div>
              <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                 <Globe size={14} className="text-cyan-400" /> Pull-Sync Active
              </div>
           </div>

           {/* Input Form */}
           <form onSubmit={handleBlacklistSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 border-b border-slate-800 pb-10 mb-10">
              <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Remitente a Bloquear (Email o Dominio)</label>
                 <div className="relative">
                    <UserX className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                    <input 
                      type="text" 
                      placeholder="spammer@bad-domain.com o *@bad.com"
                      value={blacklistForm.block_list_item}
                      onChange={(e) => setBlacklistForm({...blacklistForm, block_list_item: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 pl-12 pr-6 text-white focus:border-red-500 outline-none transition-all font-bold text-xs"
                      required
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Razón (Auditoría)</label>
                 <input 
                      type="text" 
                      placeholder="Ej: Spam Trap Hit"
                      value={blacklistForm.reason}
                      onChange={(e) => setBlacklistForm({...blacklistForm, reason: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 px-6 text-white focus:border-cyan-400 outline-none transition-all font-bold text-xs"
                    />
              </div>
              <div className="flex items-end">
                 <button 
                   type="submit"
                   disabled={isBlacklisting}
                   className="w-full py-5 bg-red-500 hover:bg-red-600 text-slate-950 font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                   {isBlacklisting ? <RefreshCw className="animate-spin" size={18} /> : <ShieldOff size={18} />}
                   Ejecutar Bloqueo Global
                 </button>
              </div>
           </form>

           {/* Active Blacklist Table */}
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-900/30 border-b border-slate-800/50">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Objetivo</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Razón</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado Sincronización</th>
                        <th className="px-6 py-4"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                     {blacklist.map(entry => (
                        <tr key={entry.id} className="hover:bg-red-500/5 transition-colors group">
                           <td className="px-6 py-4 font-black text-white italic">{entry.target}</td>
                           <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[8px] font-black uppercase text-slate-400">
                                 {entry.type}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{entry.reason}</td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${entry.status === 'synced' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                                 <span className="text-[9px] font-black uppercase text-slate-500">{entry.status === 'synced' ? 'Propagado' : 'Pendiente'}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleRevokeBlacklist(entry.id)}
                                className="text-slate-600 hover:text-cyan-400 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors"
                              >
                                 <RotateCcw size={12} /> Deshacer
                              </button>
                           </td>
                        </tr>
                     ))}
                     {blacklist.length === 0 && (
                        <tr>
                           <td colSpan={5} className="py-8 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              Base de datos de amenazas limpia
                           </td>
                        </tr>
                     )}
                  </tbody>
              </table>
           </div>
        </div>

        {/* Events Feed */}
        <div className="lg:col-span-8 titan-glass rounded-[3rem] border border-slate-800/50 overflow-hidden">
           {/* ... (Existing Events Feed UI) ... */}
           <div className="p-8 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Terminal size={18} className="text-cyan-400" /> Security Event Log
              </h3>
           </div>
           <div className="divide-y divide-slate-800/30">
              {events.map((event) => (
                <div key={event.id} className="p-8 hover:bg-cyan-400/5 transition-colors group">
                   <div className="flex items-start justify-between">
                      <div className="flex gap-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                           event.severity === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                           event.severity === 'medium' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                           'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
                         }`}>
                            {event.severity === 'high' ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                         </div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">{event.type}</h4>
                               <span className="text-[8px] font-bold text-slate-600 font-mono tracking-tighter">{event.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xl">{event.description}</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Firewall Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="titan-glass p-8 rounded-[3rem] border border-slate-800 flex flex-col h-fit">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                <Shield size={18} className="text-cyan-400" /> Titan Firewall Rules
              </h3>
              <div className="space-y-4">
                 {rules.map((rule) => (
                   <div key={rule.id} className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-cyan-400/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="text-xs font-black text-white uppercase italic tracking-tighter leading-none mb-1">{rule.name}</p>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{rule.scope}</p>
                         </div>
                         <button 
                           onClick={() => handleToggleRule(rule.id)}
                           className={`w-10 h-5 rounded-full transition-all relative ${rule.status === 'active' ? 'bg-cyan-400' : 'bg-slate-800'}`}
                         >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${rule.status === 'active' ? 'left-5.5' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                           rule.type === 'deny' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                           rule.type === 'allow' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                           'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                         }`}>
                           {rule.type}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Security Footer Info */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-[4rem] p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <ShieldCheck size={150} />
        </div>
        <div className="w-20 h-20 bg-cyan-400/10 rounded-3xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 shrink-0">
          <Key size={40} />
        </div>
        <div className="flex-1 relative z-10">
          <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Cifrado de Grado Institucional</h4>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-2xl font-medium">
            Todos los datos almacenados y en tránsito en el Nodo Titan están protegidos por el protocolo **Aurum Crypt-Layer (AES-256-GCM)**.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityView;
