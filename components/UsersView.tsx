
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Search, RefreshCw, ShieldCheck, Mail, Database, 
  ChevronRight, X, Trash2, CreditCard, Activity, Link2, ExternalLink,
  Briefcase, Lock, UserCog, Fingerprint, Key, ShieldAlert, BadgeCheck, Save
} from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  aurumId: string;
  role: string;
  status: string;
  joined: string;
  assets: number;
}

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: 'ceo' | 'admin' | 'support';
  status: string;
  mfa: boolean;
  lastLogin: string;
}

const UsersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  
  // States
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Drawer/Modal States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  
  // Forms
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'admin' });
  const [createClientForm, setCreateClientForm] = useState({ name: '', email: '', role: 'client' });

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [clientsRes, staffRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/staff')
      ]);
      if (clientsRes.ok && staffRes.ok) {
        setClients(await clientsRes.json());
        setStaff(await staffRes.json());
      }
    } catch (e) {
      console.error("Fallo de enlace con IAM Hub");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers para Clientes ---
  const handleSyncClient = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/clients/sync', { method: 'POST' });
      fetchData(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createClientForm)
      });
      if (res.ok) {
        setIsCreateClientModalOpen(false);
        setCreateClientForm({ name: '', email: '', role: 'client' });
        fetchData(true);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm("¿Revocar acceso institucional a este cliente?")) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    setClients(prev => prev.filter(c => c.id !== id));
    if (selectedClient?.id === id) setSelectedClient(null);
  };

  // --- Handlers para Staff ---
  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });
      if (res.ok) {
        setIsInviteModalOpen(false);
        setInviteForm({ name: '', email: '', role: 'admin' });
        fetchData(true);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm("¿Eliminar credenciales de acceso de este miembro del equipo?")) return;
    await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    await fetch(`/api/staff/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    fetchData(true);
  };

  const filteredClients = useMemo(() => clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [clients, searchTerm]);

  const filteredStaff = useMemo(() => staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [staff, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Identidad & Acceso</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Aurum Capital IAM Protocol</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
           <button 
             onClick={() => setActiveTab('clients')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'clients' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
           >
             <Database size={14} /> Clientes
           </button>
           <button 
             onClick={() => setActiveTab('staff')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'staff' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
           >
             <UserCog size={14} /> Staff Interno
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Stats */}
        <div className="space-y-6 lg:col-span-1">
          <div className="titan-glass p-6 rounded-[2.5rem] border border-slate-800/50">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">IAM Metrics</p>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Staff Activo</span>
                <span className="text-xl font-black text-white italic">{staff.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Clientes Total</span>
                <span className="text-xl font-black text-cyan-400 italic">{clients.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">2FA Enforced</span>
                <span className="text-xl font-black text-green-400 italic">100%</span>
              </div>
            </div>
            
            <div className="mt-8 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                 <ShieldCheck size={16} className="text-cyan-400" />
                 <span className="text-[9px] font-black text-white uppercase">Security Audit</span>
              </div>
              <p className="text-[8px] text-slate-500 font-mono">Last Scan: 10m ago</p>
              <p className="text-[8px] text-slate-500 font-mono">Issues: None</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 titan-glass rounded-[3rem] border border-slate-800/50 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center gap-6">
            <div className="flex-1 relative group max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400" size={18} />
              <input 
                type="text" 
                placeholder={activeTab === 'clients' ? "Buscar cliente..." : "Buscar miembro del equipo..."}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === 'clients' ? (
              <div className="flex gap-2">
                <button 
                  onClick={handleSyncClient}
                  className="p-4 bg-slate-900 border border-slate-800 text-slate-500 hover:text-cyan-400 rounded-2xl transition-all"
                  title="Sincronizar desde ERP Externo"
                >
                  <RefreshCw className={isSyncing ? 'animate-spin' : ''} size={20}/>
                </button>
                <button 
                  onClick={() => setIsCreateClientModalOpen(true)}
                  className="p-4 bg-cyan-400 text-slate-950 rounded-2xl shadow-cyan-glow hover:scale-105 transition-transform"
                  title="Crear Cliente Manual"
                >
                  <UserPlus size={20}/>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="p-4 bg-cyan-400 text-slate-950 rounded-2xl shadow-cyan-glow hover:scale-105 transition-transform"
              >
                <UserPlus size={20}/>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'clients' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-900/10">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identidad Aurum</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Activos</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filteredClients.map((client) => (
                    <tr 
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className="hover:bg-cyan-400/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-cyan-400 transition-all">
                            <Database size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white italic tracking-tight mb-1">{client.name}</span>
                            <span className="text-[9px] font-black text-cyan-400 font-mono tracking-tighter">{client.aurumId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-200">
                        {client.assets} <span className="text-[9px] text-slate-600 uppercase">Servicios</span>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${client.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                           {client.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                           className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                         >
                           <Trash2 size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-900/10">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operador</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rol de Acceso</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Seguridad</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-cyan-400/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                             s.role === 'ceo' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 
                             s.role === 'admin' ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' :
                             'bg-slate-900 border-slate-800 text-slate-500'
                           }`}>
                              {s.role === 'ceo' ? <ShieldAlert size={20} /> : s.role === 'admin' ? <ShieldCheck size={20} /> : <UserCog size={20} />}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-white italic tracking-tight mb-1">{s.name}</span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase">{s.email}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <select 
                           value={s.role}
                           onChange={(e) => handleRoleChange(s.id, e.target.value)}
                           className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-400 cursor-pointer"
                         >
                            <option value="ceo">CEO / Founder</option>
                            <option value="admin">SysAdmin</option>
                            <option value="support">L1 Support</option>
                         </select>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                            {s.mfa ? <Fingerprint size={14} className="text-green-500" /> : <ShieldAlert size={14} className="text-red-500" />}
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.mfa ? 'MFA Activo' : 'Riesgo'}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button 
                           onClick={() => handleDeleteStaff(s.id)}
                           className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                         >
                           <Trash2 size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Manual Client Creation Modal */}
      {isCreateClientModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsCreateClientModalOpen(false)}></div>
          <div className="relative w-full max-w-md titan-glass rounded-[3rem] border border-slate-800 shadow-2xl p-10 animate-in zoom-in-95 duration-500">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-950">
                   <UserPlus size={24} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Alta Manual</h3>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Registro de Cliente Institucional</p>
                </div>
             </div>

             <form onSubmit={handleCreateClient} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Nombre de la Organización</label>
                   <input 
                     type="text" 
                     placeholder="Ej: Aurum Tech Labs"
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                     value={createClientForm.name}
                     onChange={(e) => setCreateClientForm({...createClientForm, name: e.target.value})}
                     required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Correo de Contacto</label>
                   <input 
                     type="email" 
                     placeholder="admin@empresa.com"
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                     value={createClientForm.email}
                     onChange={(e) => setCreateClientForm({...createClientForm, email: e.target.value})}
                     required
                   />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-6 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl transition-all shadow-cyan-glow uppercase text-xs tracking-widest flex items-center justify-center gap-3 mt-4"
                >
                  {isSyncing ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>}
                  Registrar en CRM
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsInviteModalOpen(false)}></div>
          <div className="relative w-full max-w-md titan-glass rounded-[3rem] border border-slate-800 shadow-2xl p-10 animate-in zoom-in-95 duration-500">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-950">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Nuevo Operador</h3>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Generar Credenciales de Acceso</p>
                </div>
             </div>

             <form onSubmit={handleInviteStaff} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Nombre Completo</label>
                   <input 
                     type="text" 
                     placeholder="Ej: Sarah Connor"
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                     value={inviteForm.name}
                     onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                     required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Correo Corporativo</label>
                   <input 
                     type="email" 
                     placeholder="sarah@qhosting.net"
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                     value={inviteForm.email}
                     onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                     required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Nivel de Privilegios</label>
                   <select 
                     value={inviteForm.role}
                     onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold appearance-none"
                   >
                      <option value="admin">SysAdmin (Acceso Total)</option>
                      <option value="support">Soporte Técnico (Limitado)</option>
                      <option value="ceo">Auditor (Lectura)</option>
                   </select>
                </div>
                
                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-6 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl transition-all shadow-cyan-glow uppercase text-xs tracking-widest flex items-center justify-center gap-3 mt-4"
                >
                  {isSyncing ? <RefreshCw className="animate-spin" size={16}/> : <Key size={16}/>}
                  Generar Llaves de Acceso
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
