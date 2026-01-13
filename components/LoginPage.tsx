
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ChevronRight, Zap, RefreshCw, Eye, EyeOff, ShieldAlert, Fingerprint } from 'lucide-react';

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    // Simulación de handshake criptográfico con el nodo central
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 md:p-6 relative overflow-hidden">
      {/* Capas de Red Neuronal (Decorativas) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-50">
        {/* Glow perimetral dinámico */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-600/50 rounded-[2.5rem] blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative titan-glass rounded-[2.5rem] border border-slate-800/80 p-8 md:p-12 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-700">
          
          {/* Header Institucional */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-cyan-400/20 blur-xl rounded-full"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center text-slate-950 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 cursor-none">
                <ShieldCheck size={40} strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
              Q-SYSTEM <span className="text-cyan-400 block mt-1 not-italic tracking-widest text-[10px] opacity-70">Access Portal</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="email-input" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-cyan-400 transition-colors">
                  Identidad Digital
                </label>
                <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Aurum Network</span>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors pointer-events-none z-20">
                  <Mail size={18} />
                </div>
                <input 
                  id="email-input"
                  autoFocus
                  type="email" 
                  autoComplete="email"
                  placeholder="usuario@qhosting.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800/80 rounded-2xl py-5 pl-14 pr-6 text-white focus:border-cyan-400/50 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all placeholder:text-slate-800 font-bold text-sm relative z-10"
                  required
                />
              </div>
            </div>

            {/* Campo Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password-input" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-cyan-400 transition-colors">
                  Clave de Encriptación
                </label>
                <button type="button" className="text-[9px] font-black text-slate-700 hover:text-cyan-400 transition-colors uppercase">¿Olvidó su clave?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors pointer-events-none z-20">
                  <Lock size={18} />
                </div>
                <input 
                  id="password-input"
                  type={showPassword ? "text" : "password"} 
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800/80 rounded-2xl py-5 pl-14 pr-14 text-white focus:border-cyan-400/50 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all placeholder:text-slate-800 font-bold text-sm relative z-10"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors z-20 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full group/btn relative overflow-hidden bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black py-5 rounded-2xl transition-all shadow-cyan-glow flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.25em] disabled:opacity-70 active:scale-[0.97] z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Autenticando Nodo...</span>
                </div>
              ) : (
                <>Sincronizar Acceso <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Footer del Formulario */}
          <div className="mt-10 pt-8 border-t border-slate-800/50">
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
                  <Fingerprint size={14} className="text-cyan-400" />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Biometric Auth</p>
                  <p className="text-[7px] font-bold text-slate-600 uppercase mt-1">Status: Standby</p>
               </div>
               <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
                  <ShieldAlert size={14} className="text-yellow-500" />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Log</p>
                  <p className="text-[7px] font-bold text-slate-600 uppercase mt-1">IP: 192.168.0.1</p>
               </div>
            </div>
            
            <p className="text-center mt-8 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] select-none">
              Institutional Grade Infrastructure
            </p>
          </div>
        </div>

        {/* Soporte Lateral sutil */}
        <div className="mt-8 flex justify-center gap-10">
          <button className="text-[9px] font-black text-slate-600 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]">Soporte Técnico</button>
          <button className="text-[9px] font-black text-slate-600 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]">Estado del Nodo</button>
        </div>
      </div>

      {/* Copyright Flotante */}
      <div className="absolute bottom-10 left-10 text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] pointer-events-none select-none hidden lg:block">
        AURUM CAPITAL HOLDING // TITAN SECURE LAYER
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
