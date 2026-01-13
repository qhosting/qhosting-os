
import React, { useState, useEffect } from 'react';
import { Zap, Server, Activity, Globe, Cpu, Database, HardDrive, RefreshCw, AlertTriangle, ShieldCheck, ChevronRight, Terminal, Info, LayoutTemplate, Layers, Lock, ExternalLink, XCircle } from 'lucide-react';

interface TitanNode {
  id: string;
  location: string;
  ip: string;
  status: 'online' | 'maintenance' | 'rebooting' | 'offline';
  load: number;
  ram: number;
  storage: number;
  software: string; // cPanel | Plesk | Bare Metal
  accounts: number;
}

const NodesView: React.FC = () => {
  const [nodes, setNodes] = useState<TitanNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TitanNode | null>(null);
  const [telemetry, setTelemetry] = useState({ inbound: '4.2 Gbps', outbound: '1.8 Gbps', activeTasks: 142 });

  const fetchNodes = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch('/api/nodes');
      if (response.ok) {
        const data = await response.json();
        setNodes(data);
        if (selectedNode) {
          const updated = data.find((n: TitanNode) => n.id === selectedNode.id);
          if (updated) setSelectedNode(updated);
        }
      }
    } catch (e) {
      console.error("Fallo de enlace con el Centro de Comando Titan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(() => fetchNodes(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRedirectACC = (nodeId: string, action: string) => {
    // Redirección segura al Aurum Control Center para gestión crítica
    const confirmation = confirm(`Esta acción requiere autorización de Nivel 3.\n\nSerá redirigido a acc.aurumcapital.mx para gestionar: ${action} en el nodo ${nodeId}.`);
    if (confirmation) {
        window.open(`https://acc.aurumcapital.mx/nodes/${nodeId}/manage?action=${action}`, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Comando de Nodos</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Monitorización Satelital // Enlace ACC Activo</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="titan-glass px-6 py-3 rounded-xl border border-slate-800/50 flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase">Enlace Satelital</span>
              <span className="text-xs font-black text-green-500 italic">Conectado (acc.aurum)</span>
            </div>
            <Activity className="text-green-500 animate-pulse" size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rack de Servidores */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nodes.map((node) => (
              <div 
                key={node.id} 
                onClick={() => setSelectedNode(node)}
                className={`titan-glass p-8 rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden ${
                  selectedNode?.id === node.id ? 'border-cyan-400 bg-cyan-400/5 shadow-cyan-glow' : 'border-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 blur-3xl opacity-20 transition-colors ${
                  node.status === 'online' ? 'bg-green-500' : node.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>

                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                    node.software.includes('cPanel') ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                    node.software.includes('Plesk') ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {node.software.includes('cPanel') ? <LayoutTemplate size={24} /> : node.software.includes('Plesk') ? <Layers size={24} /> : <Server size={24} />}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      node.status === 'online' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      node.status === 'maintenance' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {node.status}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 mt-2">{node.ip}</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{node.id}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Globe size={12} /> {node.location}
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                      <span>Carga CPU</span>
                      <span className={node.load > 80 ? 'text-red-400' : 'text-cyan-400'}>{node.load}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 rounded-full ${node.load > 80 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-400 shadow-cyan-glow'}`}
                        style={{ width: `${node.load}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <Cpu size={14} className="text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-400">{node.ram}GB RAM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Database size={14} className="text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-400">{node.accounts} Cuentas</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Consola de Eventos Globales */}
          <div className="titan-glass rounded-[2.5rem] border border-slate-800/50 overflow-hidden">
             <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal size={18} className="text-cyan-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">ACC Telemetry Log</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
             </div>
             <div className="p-6 bg-slate-950/80 font-mono text-[10px] space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                <p className="text-slate-500"><span className="text-cyan-400">[10:42:01]</span> ACC-SYNC: Telemetría recibida de cPanel Node 01</p>
                <p className="text-slate-500"><span className="text-cyan-400">[10:43:15]</span> WHM-API: 142 cuentas sincronizadas correctamente</p>
                <p className="text-yellow-500/80"><span className="text-yellow-500">[10:45:00]</span> PLESK: Actualización de seguridad pendiente en nodo FRA-1</p>
                <p className="text-slate-500"><span className="text-cyan-400">[10:46:22]</span> KERNEL: Optimización CloudLinux aplicada remotamente</p>
                <p className="text-green-500/80"><span className="text-green-500">[10:47:10]</span> HEALTH: Clúster Aurum operando a capacidad nominal</p>
             </div>
          </div>
        </div>

        {/* Panel de Control de Nodo Seleccionado */}
        <div className="lg:col-span-4">
           {selectedNode ? (
             <div className="titan-glass p-8 rounded-[3rem] border border-slate-800 sticky top-24 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                    <Activity size={32} />
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-600 hover:text-white transition-colors">
                    <XCircle size={24} />
                  </button>
                </div>

                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1 leading-tight">{selectedNode.id}</h3>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-8">{selectedNode.software}</p>

                <div className="space-y-6">
                   <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Live Specs</p>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-bold italic">RAM Allocation</span>
                            <span className="text-[10px] text-white font-black">{selectedNode.ram} GB Dedicated</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-bold italic">NVMe Usage</span>
                            <span className="text-[10px] text-white font-black">{selectedNode.storage}% Occupied</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-bold italic">Active Accounts</span>
                            <span className="text-[10px] text-green-500 font-black">{selectedNode.accounts} Clients</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-center gap-3">
                      <Lock size={16} className="text-yellow-500" />
                      <p className="text-[9px] text-yellow-500/80 font-bold uppercase leading-tight">
                         Gestión bloqueada en modo visualizador. Acceda al ACC para cambios.
                      </p>
                   </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-800 space-y-4">
                   <button 
                     onClick={() => handleRedirectACC(selectedNode.id, 'reboot')}
                     className="w-full py-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-400/50 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                   >
                     <ExternalLink size={14} /> Gestión de Energía (ACC)
                   </button>
                   <button 
                     onClick={() => handleRedirectACC(selectedNode.id, 'dashboard')}
                     className="w-full py-5 bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-cyan-glow hover:bg-cyan-500 transition-all flex items-center justify-center gap-3"
                   >
                     <ShieldCheck size={16} /> Panel Maestro ACC
                   </button>
                </div>
             </div>
           ) : (
             <div className="titan-glass p-12 rounded-[3rem] border border-slate-800/50 h-[500px] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-800 border border-slate-800 mb-8">
                  <HardDrive size={48} />
                </div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] leading-relaxed max-w-[220px]">
                  Seleccione un nodo del rack para visualizar la telemetría satelital
                </p>
             </div>
           )}
        </div>
      </div>

      {/* Footer Info Hub */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-[4rem] p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap size={150} />
        </div>
        <div className="w-20 h-20 bg-cyan-400/10 rounded-3xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 shrink-0">
          <Info size={40} />
        </div>
        <div className="flex-1 relative z-10">
          <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Sincronización Master Hub</h4>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-2xl font-medium">
            Toda la infraestructura Titan se comunica con el Master Hub de Aurum Capital (acc.aurumcapital.mx) vía fibra óptica dedicada. QHOSTING actúa como visualizador de solo lectura para garantizar la seguridad operativa.
          </p>
        </div>
        <div className="flex gap-4">
           <a href="https://acc.aurumcapital.mx" target="_blank" rel="noreferrer" className="px-10 py-5 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all flex items-center">
             Ir a ACC <ExternalLink size={14} className="ml-2" />
           </a>
        </div>
      </div>
    </div>
  );
};

export default NodesView;
