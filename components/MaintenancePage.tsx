
import React from 'react';
import { Construction, Zap, Wrench, ShieldAlert } from 'lucide-react';

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
      
      <div className="text-center relative z-10 max-w-2xl">
        <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-2xl mx-auto mb-10 transform rotate-45">
          <Construction size={40} className="-rotate-45" />
        </div>
        
        <h1 className="text-5xl font-black text-white tracking-tighter mb-6 uppercase italic">
          Optimización en <span className="text-cyan-400">Progreso</span>
        </h1>
        
        <p className="text-slate-400 text-lg leading-relaxed mb-10">
          Estamos realizando una actualización crítica en los nodos <span className="text-white font-bold">Titan-01</span> y <span className="text-white font-bold">Titan-02</span>. 
          El Q-SYSTEM estará operativo nuevamente en unos minutos para garantizar el 99.9% de uptime.
        </p>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: 'DB SYNC', icon: <Wrench size={16}/> },
            { label: 'CORE UPDATE', icon: <Zap size={16}/> },
            { label: 'SECURE BOOT', icon: <ShieldAlert size={16}/> }
          ].map(item => (
            <div key={item.label} className="titan-glass p-4 rounded-2xl border border-slate-800/50">
              <div className="text-cyan-400 mb-2 flex justify-center">{item.icon}</div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
          QHOSTING.NET Engineering Group
        </div>
      </div>

      {/* Decorative upward lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-1/4 w-px h-64 bg-gradient-to-t from-cyan-400 to-transparent animate-bounce"></div>
        <div className="absolute bottom-20 left-1/2 w-px h-96 bg-gradient-to-t from-cyan-400 to-transparent animate-bounce delay-300"></div>
        <div className="absolute bottom-10 right-1/4 w-px h-48 bg-gradient-to-t from-cyan-400 to-transparent animate-bounce delay-700"></div>
      </div>
    </div>
  );
};

export default MaintenancePage;
