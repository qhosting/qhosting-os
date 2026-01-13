
import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Globe, Zap, Shield, Cpu, Database, Link, Sliders, Layout, Bell, Key, RefreshCw, CheckCircle2, Terminal, Activity, Eye, Lock, Webhook, Server, AlertTriangle, Fingerprint, Clock, Radio, Power, EyeOff, X, MessageCircle, Workflow, QrCode, MessageSquare
} from 'lucide-react';

interface SystemSettings {
  nodeLocation: string;
  masterHubEndpoint: string;
  aurumApiKey: string;
  syncInterval: number;
  whiteLabel: { 
    brandName: string; 
    primaryColor: string;
    logoUrl: string;
  };
  automation: {
    autoSuspendDays: number;
    enableAutoSuspend: boolean;
    backupRetentionDays: number;
    provisioningQueueActive: boolean;
  };
  securityPolicy: {
    enforceMfaAdmin: boolean;
    sessionTimeoutMins: number;
    allowedIps: string[];
  };
  webhookSecret: string;
  notificationEvents: {
    newOrder: boolean;
    ticketCreated: boolean;
    serverAlert: boolean;
    invoicePaid: boolean;
  };
  maintenanceMode: boolean;
}

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Integration States
  const [integrations, setIntegrations] = useState<any>(null);
  const [chatwootConfig, setChatwootConfig] = useState({ api_access_token: '', inbox_id: '', url: '', enabled: false });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [res, intRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/integrations')
        ]);
        if (res.ok) setSettings(await res.json());
        if (intRes.ok) {
           const intData = await intRes.json();
           setIntegrations(intData);
           setChatwootConfig(intData.chatwoot);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setTimeout(() => setIsSaving(false), 1000);
      }
    } catch (e) {
      setIsSaving(false);
    }
  };

  const handleSaveIntegrations = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/integrations/chatwoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatwootConfig)
      });
      if(res.ok) setTimeout(() => setIsSaving(false), 1000);
    } catch(e) {
      setIsSaving(false);
    }
  };

  const handleTestHub = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/test-hub', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (e) {
      setTestResult({ success: false, error: 'Link Down' });
    } finally {
      setIsTesting(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [section]: {
          ...(settings[section] as object),
          [key]: value
        }
      });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <RefreshCw className="text-cyan-400 animate-spin" size={48} />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descifrando Protocolos Titan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Comando de Configuración</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Gestión de Constantes de Nodo // Aurum Institutional Layer</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleTestHub}
            disabled={isTesting}
            className="bg-slate-900 border border-slate-800 text-slate-400 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:text-white transition-all disabled:opacity-50"
          >
            {isTesting ? <RefreshCw className="animate-spin" size={16} /> : <Activity size={16} />} 
            Probar Master Link
          </button>
          <button 
            onClick={activeTab === 'integrations' ? handleSaveIntegrations : handleSave}
            disabled={isSaving}
            className="bg-cyan-400 hover:bg-cyan-500 text-slate-950 px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-cyan-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} 
            Sincronizar Cluster
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2 h-fit sticky top-24">
          {[
            { id: 'general', label: 'Infraestructura', icon: <Cpu size={18}/> },
            { id: 'branding', label: 'Identidad Visual', icon: <Layout size={18}/> },
            { id: 'automation', label: 'Automatización', icon: <Zap size={18}/> },
            { id: 'integrations', label: 'Integraciones (Beta)', icon: <Workflow size={18}/> },
            { id: 'security', label: 'Políticas de Acceso', icon: <Shield size={18}/> },
            { id: 'webhooks', label: 'Notificaciones', icon: <Webhook size={18}/> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${
                activeTab === tab.id 
                ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400 shadow-xl' 
                : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-900 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-4">
                {tab.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </div>
              {activeTab === tab.id && <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-cyan-glow"></div>}
            </button>
          ))}

          <div className="mt-10 p-6 bg-slate-900/40 rounded-[2rem] border border-slate-800/50">
             <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Terminal size={12} className="text-cyan-400" /> System Health
             </h4>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-bold text-slate-600 uppercase">Latency</span>
                   <span className="text-[9px] font-black text-green-500">14ms</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-bold text-slate-600 uppercase">Node ID</span>
                   <span className="text-[9px] font-black text-white">TITAN_MIA_01</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-bold text-slate-600 uppercase">Version</span>
                   <span className="text-[9px] font-black text-slate-400">v2.5.0-beta</span>
                </div>
             </div>
          </div>
        </div>

        {/* Settings Content Card */}
        <div className="lg:col-span-9 titan-glass p-12 rounded-[4rem] border border-slate-800/50 relative overflow-hidden min-h-[600px]">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Settings size={200} />
           </div>

           {activeTab === 'general' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Parámetros de Nodo</h3>
                   <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Arquitectura de alto rendimiento Titan 2.5</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">DataCenter Region (TIER IV)</label>
                      <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 rounded-3xl px-8 py-5 group focus-within:border-cyan-400/50 transition-all">
                         <Globe className="text-cyan-400 group-focus-within:animate-spin" size={20} />
                         <input 
                           type="text" 
                           value={settings.nodeLocation}
                           onChange={(e) => setSettings({...settings, nodeLocation: e.target.value})}
                           className="bg-transparent border-none outline-none text-sm text-white font-bold w-full placeholder:text-slate-800"
                         />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Sync Threshold (Heartbeat)</label>
                      <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 rounded-3xl px-8 py-5 group focus-within:border-cyan-400/50 transition-all">
                         <Sliders className="text-cyan-400" size={20} />
                         <input 
                           type="number" 
                           value={settings.syncInterval}
                           onChange={(e) => setSettings({...settings, syncInterval: parseInt(e.target.value)})}
                           className="bg-transparent border-none outline-none text-sm text-white font-bold w-full"
                         />
                         <span className="text-[10px] font-black text-slate-700 uppercase">ms</span>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Master Hub Endpoint</label>
                      <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 rounded-3xl px-8 py-5 group focus-within:border-cyan-400/50 transition-all">
                         <Server className="text-cyan-400" size={20} />
                         <input 
                           type="text" 
                           value={settings.masterHubEndpoint}
                           onChange={(e) => setSettings({...settings, masterHubEndpoint: e.target.value})}
                           className="bg-transparent border-none outline-none text-sm text-white font-mono w-full"
                         />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Institutional Key</label>
                      <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 rounded-3xl px-8 py-5 group focus-within:border-cyan-400/50 transition-all relative">
                         <Key className="text-cyan-400" size={20} />
                         <input 
                           type="password" 
                           value={settings.aurumApiKey}
                           onChange={(e) => setSettings({...settings, aurumApiKey: e.target.value})}
                           className="bg-transparent border-none outline-none text-sm text-white font-mono tracking-[0.5em] w-full"
                         />
                         <Lock className="absolute right-8 text-slate-800" size={16} />
                      </div>
                   </div>
                </div>

                <div className="p-10 bg-gradient-to-br from-slate-900/50 to-slate-950/80 border border-slate-800 rounded-[3rem] flex items-center justify-between group hover:border-orange-500/30 transition-all">
                   <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all ${settings.maintenanceMode ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-xl' : 'bg-slate-800 text-slate-600 border-slate-700'}`}>
                         <AlertTriangle size={32} />
                      </div>
                      <div>
                         <p className="text-xl font-black text-white uppercase italic leading-none mb-2">Modo Mantenimiento Singular</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Desconecta el acceso institucional a clientes nivel 1 y 2</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                     className={`w-20 h-10 rounded-full transition-all relative flex items-center px-1.5 ${settings.maintenanceMode ? 'bg-orange-500 shadow-lg' : 'bg-slate-800 shadow-inner'}`}
                   >
                      <div className={`w-7 h-7 bg-white rounded-full transition-all shadow-xl ${settings.maintenanceMode ? 'translate-x-10' : 'translate-x-0'}`}></div>
                   </button>
                </div>
             </div>
           )}

           {/* TITAN NEXUS: INTEGRATIONS VIEW */}
           {activeTab === 'integrations' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Titan Nexus</h3>
                   <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Hiper-Automatización & Comunicaciones Unificadas</p>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20">
                         <Workflow size={24} />
                      </div>
                      <div>
                         <p className="text-xs font-black text-white uppercase">n8n Engine</p>
                         <span className="text-[9px] font-bold text-green-500">Operativo</span>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                         <MessageCircle size={24} />
                      </div>
                      <div>
                         <p className="text-xs font-black text-white uppercase">WAHA Core</p>
                         <span className="text-[9px] font-bold text-cyan-400">Listo</span>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-700">
                         <MessageSquare size={24} />
                      </div>
                      <div>
                         <p className="text-xs font-black text-white uppercase">Chatwoot</p>
                         <span className="text-[9px] font-bold text-slate-500">{chatwootConfig.enabled ? 'Sincronizado' : 'Inactivo'}</span>
                      </div>
                   </div>
                </div>

                {/* WAHA Section */}
                <div className="p-8 bg-slate-950/50 border border-slate-800 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
                   <div className="w-40 h-40 bg-white rounded-2xl p-2 shrink-0">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TitanNexusAuth" alt="WAHA QR" className="w-full h-full mix-blend-multiply" />
                   </div>
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                         <QrCode className="text-green-500" size={24} />
                         <h4 className="text-lg font-black text-white uppercase italic">WhatsApp Link</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                         Escanee este código QR con el dispositivo maestro para vincular la sesión de WhatsApp al núcleo de mensajería de Titan.
                      </p>
                      <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-800 transition-all">
                         Regenerar Sesión WAHA
                      </button>
                   </div>
                </div>

                {/* Chatwoot Config */}
                <div className="space-y-6">
                   <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={16} className="text-cyan-400" /> Chatwoot CRM Bridge
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Instancia URL</label>
                         <input 
                           type="text" 
                           placeholder="https://app.chatwoot.com"
                           value={chatwootConfig.url}
                           onChange={(e) => setChatwootConfig({...chatwootConfig, url: e.target.value})}
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:border-cyan-400/50 outline-none transition-all font-bold"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Inbox ID</label>
                         <input 
                           type="text" 
                           placeholder="12"
                           value={chatwootConfig.inbox_id}
                           onChange={(e) => setChatwootConfig({...chatwootConfig, inbox_id: e.target.value})}
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:border-cyan-400/50 outline-none transition-all font-bold"
                         />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">API Access Token</label>
                         <input 
                           type="password" 
                           placeholder="••••••••••••••••••••••••"
                           value={chatwootConfig.api_access_token}
                           onChange={(e) => setChatwootConfig({...chatwootConfig, api_access_token: e.target.value})}
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:border-cyan-400/50 outline-none transition-all font-mono"
                         />
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setChatwootConfig({...chatwootConfig, enabled: !chatwootConfig.enabled})}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${chatwootConfig.enabled ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                      >
                         <Power size={14} /> {chatwootConfig.enabled ? 'Bridge Activo' : 'Bridge Desactivado'}
                      </button>
                   </div>
                </div>
             </div>
           )}

           {/* EXISTING TABS (Branding, Automation, etc...) - Preserved Logic */}
           {activeTab === 'branding' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                   <div>
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Identidad del Nodo</h3>
                      <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">White-labeling para despliegues corporativos</p>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                      <Eye size={14} className="text-cyan-400" />
                      <span className="text-[9px] font-black uppercase text-slate-400">Vista Previa</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Nombre Comercial</label>
                         <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 rounded-3xl px-8 py-5 group focus-within:border-cyan-400/50 transition-all">
                           <Fingerprint className="text-cyan-400" size={20} />
                           <input 
                             type="text" 
                             value={settings.whiteLabel.brandName}
                             onChange={(e) => updateSetting('whiteLabel', 'brandName', e.target.value)}
                             className="bg-transparent border-none outline-none text-sm text-white font-black uppercase w-full"
                           />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Accent Color</label>
                         <div className="flex gap-4">
                            <div className="relative group overflow-hidden rounded-2xl">
                               <input 
                                 type="color" 
                                 value={settings.whiteLabel.primaryColor}
                                 onChange={(e) => updateSetting('whiteLabel', 'primaryColor', e.target.value)}
                                 className="w-16 h-16 bg-slate-950 border border-slate-800 cursor-pointer p-0 opacity-0 absolute inset-0 z-20"
                               />
                               <div className="w-16 h-16 absolute inset-0 z-10" style={{ backgroundColor: settings.whiteLabel.primaryColor }}></div>
                            </div>
                            <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-6 text-sm text-white font-mono tracking-widest">
                               {settings.whiteLabel.primaryColor.toUpperCase()}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Live Preview Card */}
                   <div className="relative bg-slate-950 rounded-[3rem] border border-slate-800 p-8 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                      <div className="absolute top-0 w-full h-1" style={{ backgroundColor: settings.whiteLabel.primaryColor }}></div>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-950 mb-6 shadow-lg" style={{ backgroundColor: settings.whiteLabel.primaryColor }}>
                         <Layout size={32} />
                      </div>
                      <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{settings.whiteLabel.brandName}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Access Portal</p>
                      <button className="mt-8 px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-950 shadow-lg transform scale-100" style={{ backgroundColor: settings.whiteLabel.primaryColor }}>
                         Iniciar Sesión
                      </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'automation' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Lógica de Automatización</h3>
                   <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Reglas de negocio para ciclos de vida de servicios</p>
                </div>

                <div className="space-y-8">
                   <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
                            <Power size={24} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-white uppercase italic">Auto-Suspensión por Impago</p>
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">Desactiva nodos automáticamente tras vencimiento</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => updateSetting('automation', 'enableAutoSuspend', !settings.automation.enableAutoSuspend)}
                        className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${settings.automation.enableAutoSuspend ? 'bg-cyan-400' : 'bg-slate-800'}`}
                      >
                         <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.automation.enableAutoSuspend ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                   </div>

                   {settings.automation.enableAutoSuspend && (
                      <div className="space-y-4 animate-in slide-in-from-top-2">
                         <div className="flex justify-between px-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Días de Gracia antes de Suspensión</label>
                            <span className="text-[10px] font-black text-white">{settings.automation.autoSuspendDays} Días</span>
                         </div>
                         <input 
                           type="range" 
                           min="1" 
                           max="30" 
                           value={settings.automation.autoSuspendDays}
                           onChange={(e) => updateSetting('automation', 'autoSuspendDays', parseInt(e.target.value))}
                           className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                         />
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Backup Retention Policy</p>
                         <select 
                           value={settings.automation.backupRetentionDays}
                           onChange={(e) => updateSetting('automation', 'backupRetentionDays', parseInt(e.target.value))}
                           className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none focus:border-cyan-400 transition-all"
                         >
                            <option value={7}>7 Días (Standard)</option>
                            <option value={30}>30 Días (Compliant)</option>
                            <option value={90}>90 Días (Enterprise)</option>
                         </select>
                      </div>
                      <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
                         <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cola de Aprovisionamiento</p>
                            <p className="text-xs font-bold text-white">{settings.automation.provisioningQueueActive ? 'PROCESANDO' : 'PAUSADA'}</p>
                         </div>
                         <Activity size={24} className={settings.automation.provisioningQueueActive ? 'text-green-500 animate-pulse' : 'text-slate-600'} />
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'security' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Políticas de Acceso</h3>
                   <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Control de perímetro y sesiones administrativas</p>
                </div>

                <div className="space-y-6">
                   <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                            <Fingerprint size={24} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-white uppercase italic">Forzar MFA Administrativo</p>
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">Obligatorio para roles CEO/ADMIN</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => updateSetting('securityPolicy', 'enforceMfaAdmin', !settings.securityPolicy.enforceMfaAdmin)}
                        className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${settings.securityPolicy.enforceMfaAdmin ? 'bg-cyan-400' : 'bg-slate-800'}`}
                      >
                         <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.securityPolicy.enforceMfaAdmin ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                   </div>

                   <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                         <Clock size={20} className="text-slate-500" />
                         <p className="text-sm font-black text-white uppercase italic">Session Timeout</p>
                      </div>
                      <div className="flex items-center gap-4">
                         {[15, 30, 60, 120].map(mins => (
                            <button
                              key={mins}
                              onClick={() => updateSetting('securityPolicy', 'sessionTimeoutMins', mins)}
                              className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                                 settings.securityPolicy.sessionTimeoutMins === mins 
                                 ? 'bg-cyan-400 text-slate-950 border-cyan-400 shadow-cyan-glow' 
                                 : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
                              }`}
                            >
                               {mins} min
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-4">
                            <Shield size={20} className="text-slate-500" />
                            <p className="text-sm font-black text-white uppercase italic">IP Whitelist (Admin)</p>
                         </div>
                         <span className="text-[9px] font-bold text-slate-600 bg-slate-900 px-2 py-1 rounded">IPv4 Only</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {settings.securityPolicy.allowedIps.map((ip, i) => (
                            <div key={i} className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-[10px] font-black font-mono flex items-center gap-2">
                               {ip} <button className="hover:text-white"><X size={12}/></button>
                            </div>
                         ))}
                         <button className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:text-cyan-400 hover:border-cyan-400/30 transition-all">
                            + Añadir IP
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'webhooks' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Notificaciones & Webhooks</h3>
                   <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Disparadores de eventos al Master Hub</p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Webhook Signature Secret</label>
                      <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 rounded-3xl px-8 py-5 group focus-within:border-cyan-400/50 transition-all">
                         <Lock className="text-cyan-400" size={20} />
                         <input 
                           type="text" 
                           value={settings.webhookSecret}
                           onChange={(e) => setSettings({...settings, webhookSecret: e.target.value})}
                           className="bg-transparent border-none outline-none text-sm text-white font-mono w-full"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'newOrder', label: 'Nueva Orden de Servicio', icon: <Zap size={16}/> },
                        { key: 'ticketCreated', label: 'Ticket de Soporte Creado', icon: <AlertTriangle size={16}/> },
                        { key: 'serverAlert', label: 'Alerta Crítica de Servidor', icon: <Server size={16}/> },
                        { key: 'invoicePaid', label: 'Factura Pagada', icon: <CheckCircle2 size={16}/> }
                      ].map((event) => (
                        <div key={event.key} className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center justify-between hover:border-cyan-400/20 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="text-slate-500">{event.icon}</div>
                              <span className="text-xs font-bold text-white">{event.label}</span>
                           </div>
                           <button 
                              onClick={() => updateSetting('notificationEvents', event.key, !(settings.notificationEvents as any)[event.key])}
                              className={`w-10 h-6 rounded-full transition-all relative flex items-center px-1 ${(settings.notificationEvents as any)[event.key] ? 'bg-green-500' : 'bg-slate-800'}`}
                           >
                              <div className={`w-4 h-4 bg-white rounded-full transition-all ${(settings.notificationEvents as any)[event.key] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
