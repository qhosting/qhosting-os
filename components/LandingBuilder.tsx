
import React, { useState, useEffect } from 'react';
import { Save, Layout, Type, Image as ImageIcon, Check, Eye, Smartphone, Monitor, Globe, Sparkles, RefreshCw, Edit3, X, Maximize2, Palette } from 'lucide-react';
import LandingPage from './LandingPage';
import { UserRole } from '../types';

interface LandingBuilderProps {
  userRole: string;
  onOrder: () => void;
  onLoginClick: () => void;
}

const LandingBuilder: React.FC<LandingBuilderProps> = ({ userRole, onOrder, onLoginClick }) => {
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  
  const [config, setConfig] = useState({
    heroTitle: "INFRAESTRUCTURA TITAN",
    heroSubtitle: "Hosting NVMe de Próxima Generación",
    heroDesc: "Migra hoy al sistema singular de QHOSTING.net. Rendimiento del 99.9% garantizado por hardware de grado industrial.",
    primaryColor: "#00AEEF",
    showPricing: true,
    showFeatures: true
  });

  // Carga inicial desde el Backend (Master Sync)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/landing');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Error sincronizando landing config:", error);
      } finally {
        setIsLoadingConfig(false);
      }
    };
    
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        // alert('Publicado en red global');
      }
    } catch (e) {
      console.error("Fallo al guardar configuración");
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const isAdmin = [UserRole.CEO, UserRole.ADMIN].includes(userRole as UserRole);

  if (isLoadingConfig) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 rounded-[3rem] border border-slate-800/50">
         <div className="flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-cyan-400" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sincronizando Página Pública...</p>
         </div>
      </div>
    );
  }

  // MODO LECTURA (Visitante / Admin sin editar)
  if (!isEditorActive) {
    return (
      <div className="relative h-full w-full rounded-[3rem] border border-slate-800/50 shadow-2xl overflow-hidden bg-slate-950">
        <div className="h-full overflow-y-auto custom-scrollbar">
           <LandingPage onOrder={onOrder} onLoginClick={onLoginClick} builderData={config} />
        </div>
        
        {/* HUD Trigger for Admins */}
        {isAdmin && (
           <button 
             onClick={() => setIsEditorActive(true)}
             className="absolute bottom-10 right-10 z-50 bg-slate-900/90 backdrop-blur-md border border-cyan-400/50 text-cyan-400 p-5 rounded-full shadow-[0_0_40px_rgba(0,174,239,0.3)] hover:scale-110 hover:bg-cyan-400 hover:text-slate-950 transition-all group animate-in slide-in-from-bottom-10 duration-700"
           >
             <Edit3 size={28} />
             <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none translate-x-4 group-hover:translate-x-0 shadow-xl">
               Inicializar Titan Architect
             </div>
           </button>
        )}
      </div>
    );
  }

  // MODO EDICIÓN (Titan Architect)
  return (
    <div className="h-full flex gap-6 animate-in fade-in zoom-in-95 duration-500 relative">
      {/* Editor Sidebar */}
      <div className="w-96 shrink-0 titan-glass rounded-[2.5rem] border border-slate-800/50 flex flex-col overflow-hidden animate-in slide-in-from-left-10 duration-500">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center text-slate-950 shadow-cyan-glow">
              <Layout size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-[10px] uppercase tracking-widest">Titan Architect</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Modo Edición en Vivo</span>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-slate-950 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 font-black text-[9px] uppercase tracking-widest shadow-cyan-glow"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : 'Publicar'}
          </button>
        </div>

        <div className="flex border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-5 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'content' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Type size={12}/> Contenido
          </button>
          <button 
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-5 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'style' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Palette size={12}/> Estética
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-slate-950/20">
          {activeTab === 'content' ? (
            <>
              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Type size={12}/> Título H1 (Hero)
                </label>
                <input 
                  type="text" 
                  value={config.heroTitle}
                  onChange={(e) => setConfig({...config, heroTitle: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:border-cyan-400/50 outline-none transition-all font-bold"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={12}/> Subtítulo / Claim
                </label>
                <input 
                  type="text" 
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig({...config, heroSubtitle: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:border-cyan-400/50 outline-none transition-all font-bold"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   Propuesta de Valor (Lead)
                </label>
                <textarea 
                  rows={4}
                  value={config.heroDesc}
                  onChange={(e) => setConfig({...config, heroDesc: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:border-cyan-400/50 outline-none transition-all resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="pt-4 space-y-4">
                 <div className="flex items-center justify-between p-5 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-cyan-400/30 transition-all">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Módulo de Precios</span>
                    <div 
                      onClick={() => setConfig({...config, showPricing: !config.showPricing})}
                      className={`w-12 h-6 rounded-full transition-all cursor-pointer flex items-center px-1 ${config.showPricing ? 'bg-cyan-400' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${config.showPricing ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                 </div>
              </div>
            </>
          ) : (
            <div className="space-y-8">
               <div className="space-y-6">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Identidad Visual (Color Base)</label>
                <div className="grid grid-cols-4 gap-4">
                  {['#00AEEF', '#facc15', '#6366f1', '#f43f5e', '#10b981', '#ec4899', '#8b5cf6', '#f97316'].map(color => (
                    <button 
                      key={color}
                      onClick={() => setConfig({...config, primaryColor: color})}
                      className={`w-full aspect-square rounded-xl border-2 transition-all ${config.primaryColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-8 bg-cyan-400/5 border border-cyan-400/10 rounded-[2rem] text-center">
                 <Sparkles className="text-cyan-400 mx-auto mb-4" size={32} />
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                   La interfaz aplica el protocolo "Titan Glass" por defecto para mantener la consistencia institucional del holding. Los cambios de color afectan a los acentos, bordes activos y efectos de resplandor.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Area Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-6 px-6 shrink-0">
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setViewMode('desktop')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'desktop' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white'}`}>
              <Monitor size={14}/> Desktop
            </button>
            <button onClick={() => setViewMode('mobile')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'mobile' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white'}`}>
              <Smartphone size={14}/> Mobile
            </button>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Vista Previa Interactiva
          </div>
        </div>

        {/* The Preview Iframe/Container */}
        <div className="flex-1 relative flex justify-center overflow-hidden">
           <div className={`transition-all duration-700 ease-in-out bg-slate-950 border-slate-800 overflow-hidden shadow-2xl ${
             viewMode === 'desktop' 
             ? 'w-full h-full rounded-[3.5rem] border-[12px]' 
             : 'w-[390px] h-[95%] mt-4 rounded-[3rem] border-[12px] border-slate-800 ring-1 ring-slate-700'
           }`}>
             <div className="w-full h-full overflow-y-auto custom-scrollbar">
                <LandingPage onOrder={() => {}} builderData={config} onLoginClick={() => {}} />
             </div>
           </div>
        </div>
      </div>

      {/* Floating Exit Button */}
      <button 
         onClick={() => setIsEditorActive(false)}
         className="absolute bottom-8 right-8 z-50 bg-slate-950/90 backdrop-blur-md border border-red-500/30 text-red-500 p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-red-500 hover:text-white transition-all group"
         title="Salir sin guardar"
       >
         <X size={24} />
      </button>
    </div>
  );
};

export default LandingBuilder;
