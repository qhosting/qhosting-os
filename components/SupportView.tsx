
import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Plus, Search, Filter, ChevronRight, Clock, ShieldCheck, HelpCircle, X, Send, AlertTriangle, ArrowLeft, RefreshCw, FileText, MessageCircle } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  department: string;
  date: string;
  description: string;
}

const SupportView: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // WhatsApp Notification State
  const [isSendingWA, setIsSendingWA] = useState(false);
  
  // Form State
  const [newTicket, setNewTicket] = useState({
    subject: '',
    priority: 'medium',
    department: 'Infraestructura',
    description: ''
  });

  const fetchTickets = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (e) {
      console.error("Fallo de conexión con Aurum Support Hub");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => fetchTickets(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (response.ok) {
        setIsModalOpen(false);
        setNewTicket({ subject: '', priority: 'medium', department: 'Infraestructura', description: '' });
        fetchTickets();
      }
    } catch (e) {
      alert("Error al sincronizar con el nodo de soporte");
    }
  };

  const handleWhatsAppNotify = async () => {
    if (!selectedTicket) return;
    setIsSendingWA(true);
    try {
      // Send a mock WhatsApp notification
      await fetch('/api/integrations/waha/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '5215555555555', // Mock phone
          message: `Hola, su ticket Titan ${selectedTicket.id} ha sido actualizado. Estatus: ${selectedTicket.status}.`
        })
      });
      alert('Notificación enviada a la red WhatsApp (WAHA)');
    } catch (e) {
      alert('Error en enlace WAHA');
    } finally {
      setIsSendingWA(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickets, searchQuery]);

  const stats = {
    active: tickets.filter(t => t.status !== 'resolved').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgTime: '14m'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Centro de Soporte Institucional</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Enlace Directo con el Master Hub de Aurum Capital</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-400 hover:bg-cyan-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-cyan-glow transition-all transform active:scale-95"
        >
          <Plus size={16} /> Abrir Nuevo Caso Titan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex items-center gap-6">
          <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-400/20">
            <MessageSquare size={28} />
          </div>
          <div>
            <p className="text-3xl font-black text-white italic tracking-tighter">{stats.active}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Casos Activos</p>
          </div>
        </div>
        <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex items-center gap-6">
          <div className="w-14 h-14 bg-green-400/10 rounded-2xl flex items-center justify-center text-green-400 border border-green-400/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-3xl font-black text-white italic tracking-tighter">{stats.resolved}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resueltos Global</p>
          </div>
        </div>
        <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex items-center gap-6">
          <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 border border-yellow-400/20">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-3xl font-black text-white italic tracking-tighter">{stats.avgTime}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SLA de Respuesta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 titan-glass rounded-[3rem] border border-slate-800/50 overflow-hidden">
          <div className="p-8 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 w-full max-w-md focus-within:border-cyan-400/50 transition-all">
              <Search size={18} className="text-slate-600" />
              <input 
                type="text" 
                placeholder="Buscar incidencia por ID o asunto..." 
                className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-slate-800 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => fetchTickets()}
              className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:text-cyan-400 transition-all"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-900/10">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identificador</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asunto e Incidencia</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estatus</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`hover:bg-cyan-400/5 transition-colors group cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-cyan-400/10' : ''}`}
                  >
                    <td className="px-8 py-6 text-[11px] font-black text-cyan-400 font-mono tracking-tighter">{ticket.id}</td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-100 group-hover:text-white transition-colors">{ticket.subject}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Dpto: {ticket.department}</span>
                        <span className={`w-1 h-1 rounded-full ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                        <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">{ticket.priority}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                        ticket.status === 'open' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        ticket.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                        'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {ticket.status === 'open' ? 'Abierto' : ticket.status === 'pending' ? 'En Espera' : 'Sincronizado'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 bg-slate-900/50 rounded-xl text-slate-600 group-hover:text-cyan-400 transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de Detalles del Ticket */}
        <div className="space-y-6">
          {selectedTicket ? (
            <div className="titan-glass p-8 rounded-[3rem] border border-slate-800 animate-in fade-in slide-in-from-right-4 duration-500 sticky top-24">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-cyan-glow">
                  <FileText size={32} />
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-600 hover:text-white transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1 leading-tight">{selectedTicket.subject}</h3>
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-8">{selectedTicket.id} | {selectedTicket.date}</p>

              <div className="space-y-6">
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400/50"></div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Descripción de la Incidencia</p>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedTicket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Prioridad</p>
                    <p className="text-xs font-bold text-white uppercase">{selectedTicket.priority}</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Estado</p>
                    <p className="text-xs font-bold text-cyan-400 uppercase">{selectedTicket.status}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col gap-4">
                 <button className="w-full py-5 bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-cyan-glow hover:bg-cyan-500 transition-all flex items-center justify-center gap-3">
                   <Send size={16} /> Enviar Comentario
                 </button>
                 <button 
                   onClick={handleWhatsAppNotify}
                   disabled={isSendingWA}
                   className="w-full py-4 border border-green-500/20 bg-green-500/5 text-green-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-green-500 hover:text-slate-950 transition-all flex items-center justify-center gap-2"
                 >
                   {isSendingWA ? <RefreshCw className="animate-spin" size={16}/> : <MessageCircle size={16} />} 
                   Notificar Vía WhatsApp
                 </button>
                 <button className="w-full py-4 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-white hover:border-slate-700 transition-all">
                   Cerrar Ticket
                 </button>
              </div>
            </div>
          ) : (
            <div className="titan-glass p-12 rounded-[3rem] border border-slate-800/50 h-[500px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-800 border border-slate-800 mb-8">
                <HelpCircle size={40} />
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] leading-relaxed max-w-[220px]">
                Seleccione un reporte para visualizar el análisis técnico y logs de Aurum
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Support Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-[4rem] p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <AlertTriangle size={150} />
        </div>
        <div className="w-20 h-20 bg-cyan-400/10 rounded-3xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 shrink-0">
          <HelpCircle size={48} />
        </div>
        <div className="flex-1 relative z-10">
          <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">¿Requiere Escalado TIER-IV?</h4>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-2xl font-medium">
            Si su incidencia afecta la disponibilidad del Nodo Maestro, nuestro equipo de ingenieros nivel 3 responderá en menos de **14 minutos**. Todas las sesiones están grabadas y encriptadas bajo el protocolo Titan.
          </p>
        </div>
        <button className="px-10 py-5 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white hover:border-slate-600 transition-all whitespace-nowrap shadow-xl">
          Knowledge Base Hub
        </button>
      </div>

      {/* Modal para Nuevo Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl titan-glass rounded-[3rem] border border-slate-800 shadow-2xl p-10 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-950">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Nueva Incidencia</h3>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Sincronizando con Aurum Hub</span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Asunto del Caso</label>
                  <input 
                    type="text" 
                    placeholder="Resumen del problema"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Departamento</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold appearance-none"
                    value={newTicket.department}
                    onChange={(e) => setNewTicket({...newTicket, department: e.target.value})}
                  >
                    <option value="Infraestructura">Infraestructura</option>
                    <option value="Redes">Redes y Seguridad</option>
                    <option value="Facturación">Facturación</option>
                    <option value="Soporte">Soporte Técnico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Nivel de Prioridad</label>
                <div className="flex gap-3">
                  {['low', 'medium', 'high'].map(p => (
                    <button 
                      key={p}
                      type="button"
                      onClick={() => setNewTicket({...newTicket, priority: p})}
                      className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        newTicket.priority === p 
                        ? 'bg-cyan-400 border-cyan-400 text-slate-950 shadow-cyan-glow' 
                        : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Descripción Detallada</label>
                <textarea 
                  rows={4}
                  placeholder="Por favor, proporcione logs o detalles técnicos del error observado en el nodo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-medium leading-relaxed resize-none"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl transition-all shadow-cyan-glow uppercase text-xs tracking-widest flex items-center justify-center gap-3"
              >
                Abrir Caso en Aurum Hub <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportView;
