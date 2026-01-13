
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Server, Globe, CreditCard, ExternalLink, RefreshCw, Cpu, Activity, BarChart3, Zap, TrendingUp, DollarSign, Users, Shield, Link2, Link2Off } from 'lucide-react';
import { ServiceStatus, UserRole } from '../types';

const data = [
  { name: '00h', value: 99.98 },
  { name: '04h', value: 100 },
  { name: '08h', value: 99.99 },
  { name: '12h', value: 100 },
  { name: '16h', value: 99.95 },
  { name: '20h', value: 99.99 },
  { name: '24h', value: 100 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; trend?: string }> = ({ title, value, icon, color, trend }) => (
  <div className="titan-glass p-6 rounded-2xl flex items-center justify-between border border-slate-800/50 hover:border-cyan-400/30 transition-all group relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <h3 className="text-3xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors tracking-tight">{value}</h3>
        {trend && <span className="text-[10px] text-green-400 font-bold flex items-center gap-0.5"><TrendingUp size={10}/> {trend}</span>}
      </div>
    </div>
    <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [aurumSync, setAurumSync] = useState<'connected' | 'syncing' | 'error'>('connected');

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Aurum Connectivity Bar */}
      <div className="flex items-center justify-between px-8 py-4 titan-glass rounded-2xl border border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${aurumSync === 'connected' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            Aurum Master Hub: {aurumSync === 'connected' ? 'Singularidad Sincronizada' : 'Error de Enlace'}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            <Link2 size={12} className="text-cyan-400" /> API: TIER-IV Active
          </div>
          <button className="text-[9px] font-black text-cyan-400 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
            <RefreshCw size={12} /> Forzar Re-Sync
          </button>
        </div>
      </div>

      {/* Dynamic Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userRole === UserRole.CEO ? (
          <>
            <StatCard title="Revenue Mensual" value="$12,450.00" icon={<DollarSign size={24}/>} color="text-green-400 bg-green-400" trend="+12%" />
            <StatCard title="Total Clientes" value="842" icon={<Users size={24}/>} color="text-cyan-400 bg-cyan-400" />
            <StatCard title="Churn Rate" value="1.2%" icon={<TrendingUp size={24}/>} color="text-red-400 bg-red-400" />
            <StatCard title="Salud de Red" value="99.99%" icon={<Zap size={24}/>} color="text-yellow-400 bg-yellow-400" />
          </>
        ) : userRole === UserRole.ADMIN ? (
          <>
            <StatCard title="Carga Global CPU" value="42%" icon={<Cpu size={24}/>} color="text-cyan-400 bg-cyan-400" />
            <StatCard title="Workers BullMQ" value="08/08" icon={<Activity size={24}/>} color="text-green-400 bg-green-400" />
            <StatCard title="Provisiones Hoy" value="24" icon={<Server size={24}/>} color="text-blue-400 bg-blue-400" />
            <StatCard title="Alertas WHM" value="0" icon={<Shield size={24}/>} color="text-green-400 bg-green-400" />
          </>
        ) : (
          <>
            <StatCard title="Mis Servicios" value="03" icon={<Server size={24}/>} color="text-cyan-400 bg-cyan-400" />
            <StatCard title="Dominios" value="12" icon={<Globe size={24}/>} color="text-blue-400 bg-blue-400" />
            <StatCard title="Balance Aurum" value="$42.50" icon={<CreditCard size={24}/>} color="text-orange-400 bg-orange-400" />
            <StatCard title="Uptime Real" value="100%" icon={<Zap size={24}/>} color="text-green-400 bg-green-400" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 titan-glass rounded-3xl p-8 border border-slate-800/50 relative overflow-hidden">
          <div className="mb-8">
             <h2 className="text-xl font-black text-white uppercase tracking-tight">
               {userRole === UserRole.CEO ? 'Rendimiento Financiero' : 'Uptime de Infraestructura'}
             </h2>
             <p className="text-xs text-slate-500 mt-2">Telemetría filtrada por nivel de acceso: {userRole.toUpperCase()}</p>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00AEEF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#475569" tick={{fontSize: 10}} />
                <YAxis stroke="#475569" tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="value" stroke="#00AEEF" fill="url(#colorValue)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="titan-glass rounded-3xl p-8 border border-slate-800/50 flex flex-col">
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
            {userRole === UserRole.CLIENT ? 'Aurum Log' : 'Eventos de Sistema'}
          </h2>
          <div className="flex-1 space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shadow-cyan-glow"></div>
                <div>
                  <p className="text-xs font-bold text-slate-100">
                    {userRole === UserRole.CEO ? 'Sincronización de Cliente Aurum-092' : 'Beacon enviado a Master Hub'}
                  </p>
                  <span className="text-[10px] text-slate-600 block font-mono">Hace {i}5 min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
